using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BioTime.Api.Dtos;
using BioTime.Data;
using BioTime.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BioTime.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DevicesController : ControllerBase
    {
        private readonly BioTimeDbContext _context;

        public DevicesController(BioTimeDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Device>>> GetDevices()
        {
            return await _context.Devices.ToListAsync();
        }

        [HttpPost]
        public async Task<IActionResult> CreateDevice([FromBody] Device newDevice)
        {
            if (newDevice == null || string.IsNullOrWhiteSpace(newDevice.SerialNumber))
            {
                return BadRequest("Device serial number is required.");
            }
            var device = new Device { SerialNumber = newDevice.SerialNumber, Name = newDevice.Name, IPAddress = newDevice.IPAddress, AreaId = newDevice.AreaId };
            _context.Devices.Add(device);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(CreateDevice), new { serialNumber = device.SerialNumber }, device);
        }

        [HttpPut("{serialNumber}")]
        public async Task<IActionResult> UpdateDevice(string serialNumber, [FromBody] Device updatedDevice)
        {
            var existingDevice = await _context.Devices
                .Include(d => d.Area) // Include the current area to see what it was before
                .FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (existingDevice == null)
            {
                return NotFound("Device not found.");
            }

            // Check if there are any pending commands to this device
            var pendingCommands = await _context.ServerCommands
                .Where(c => c.DeviceSerialNumber == serialNumber && !c.IsSent)
                .CountAsync();

            // If area is changing, check for pending commands and only allow the change if none exist
            bool areaChanging = existingDevice.AreaId != updatedDevice.AreaId;
            if (areaChanging && pendingCommands > 0)
            {
                return BadRequest($"Cannot change device area. There are {pendingCommands} pending commands to this device. Clear all pending commands before changing area.");
            }

            existingDevice.Name = updatedDevice.Name;
            existingDevice.IPAddress = updatedDevice.IPAddress;
            existingDevice.AreaId = updatedDevice.AreaId;

            try
            {
                // We need to save the area change first so we can access previous/next areas
                await _context.SaveChangesAsync();

                // If the area is changing, handle user synchronization
                if (areaChanging)
                {
                    // Get users who had access to the device via the old area
                    var previousUserIds = new List<int>();
                    if (existingDevice.AreaId.HasValue)
                    {
                        previousUserIds = await _context.UserAreas
                            .Where(ua => ua.AreaId == existingDevice.AreaId)
                            .Select(ua => ua.UserId)
                            .ToListAsync();
                    }

                    // Get users who will have access to the device via the new area
                    var newUserIds = new List<int>();
                    if (updatedDevice.AreaId.HasValue)
                    {
                        newUserIds = await _context.UserAreas
                            .Where(ua => ua.AreaId == updatedDevice.AreaId)
                            .Select(ua => ua.UserId)
                            .ToListAsync();
                    }

                    // Users to remove (had access before but don't have access after)
                    var usersToRemove = previousUserIds.Except(newUserIds).ToList();

                    // Users to add (don't have access before but will have access after)
                    var usersToAdd = newUserIds.Except(previousUserIds).ToList();

                    // Create commands for users to be removed/added
                    long commandIdCounter = DateTime.UtcNow.Ticks;
                    var commandText = new StringBuilder();

                    // Add commands to remove users who lost access
                    foreach (var userId in usersToRemove)
                    {
                        var user = await _context.Users.FindAsync(userId);
                        if (user != null)
                        {
                            commandText.AppendLine($"C:{commandIdCounter++}:DATA DELETE USERINFO PIN={user.Pin}");

                            // Also remove biometric templates for this user
                            // Fingerprint templates
                            var fingerprintTemplates = await _context.FingerprintTemplates
                                .Where(ft => ft.UserId == userId)
                                .ToListAsync();
                            foreach (var template in fingerprintTemplates)
                            {
                                commandText.AppendLine($"C:{commandIdCounter++}:DATA DELETE FINGERTMP PIN={user.Pin}\tFID={template.FingerIndex}");
                            }

                            // Face templates
                            var faceTemplates = await _context.FaceTemplates
                                .Where(ft => ft.Pin == user.Pin)
                                .ToListAsync();
                            foreach (var template in faceTemplates)
                            {
                                commandText.AppendLine($"C:{commandIdCounter++}:DATA DELETE FACE PIN={user.Pin}\tFID={template.FID}");
                            }

                            // Finger Vein templates
                            var fingerVeinTemplates = await _context.FingerVeinTemplates
                                .Where(fvt => fvt.Pin == user.Pin)
                                .ToListAsync();
                            foreach (var template in fingerVeinTemplates)
                            {
                                commandText.AppendLine($"C:{commandIdCounter++}:DATA DELETE FVEIN PIN={user.Pin}\tFID={template.FID}");
                            }

                            // Unified templates
                            var unifiedTemplates = await _context.UnifiedTemplates
                                .Where(ut => ut.Pin == user.Pin)
                                .ToListAsync();
                            foreach (var template in unifiedTemplates)
                            {
                                commandText.AppendLine($"C:{commandIdCounter++}:DATA DELETE BIODATA Pin={user.Pin}\tNo={template.No}");
                            }
                        }
                    }

                    // Add commands to add users who gained access
                    foreach (var userId in usersToAdd)
                    {
                        var user = await _context.Users.FindAsync(userId);
                        if (user != null)
                        {
                            // Add user info
                            commandText.AppendLine($"C:{commandIdCounter++}:DATA UPDATE USERINFO PIN={user.Pin}\tName={user.Name ?? ""}\tPri={user.Privilege}\tCard={user.CardNumber ?? ""}");

                            // Add fingerprint templates
                            var fingerprintTemplates = await _context.FingerprintTemplates
                                .Where(ft => ft.UserId == userId)
                                .ToListAsync();
                            foreach (var template in fingerprintTemplates)
                            {
                                commandText.AppendLine($"C:{commandIdCounter++}:DATA UPDATE FINGERTMP PIN={user.Pin}\tFID={template.FingerIndex}\tSize={template.Size}\tValid={template.Valid}\tTMP={template.Template}");
                            }

                            // Add face templates
                            var faceTemplates = await _context.FaceTemplates
                                .Where(ft => ft.Pin == user.Pin)
                                .ToListAsync();
                            foreach (var template in faceTemplates)
                            {
                                commandText.AppendLine($"C:{commandIdCounter++}:DATA UPDATE FACE PIN={user.Pin}\tFID={template.FID}\tSize={template.Size}\tValid={template.Valid}\tTMP={template.Template}");
                            }

                            // Add finger vein templates
                            var fingerVeinTemplates = await _context.FingerVeinTemplates
                                .Where(fvt => fvt.Pin == user.Pin)
                                .ToListAsync();
                            foreach (var template in fingerVeinTemplates)
                            {
                                commandText.AppendLine($"C:{commandIdCounter++}:DATA UPDATE FVEIN PIN={user.Pin}\tFID={template.FID}\tIndex={template.Index}\tSize={template.Size}\tValid={template.Valid}\tTmp={template.Template}");
                            }

                            // Add unified templates
                            var unifiedTemplates = await _context.UnifiedTemplates
                                .Where(ut => ut.Pin == user.Pin)
                                .ToListAsync();
                            foreach (var template in unifiedTemplates)
                            {
                                commandText.AppendLine($"C:{commandIdCounter++}:DATA UPDATE BIODATA Pin={user.Pin}\tNo={template.No}\tIndex={template.Index}\tValid={template.Valid}\tDuress={template.Duress}\tType={template.Type}\tMajorVer={template.MajorVer}\tMinorVer={template.MinorVer}\tFormat={template.Format}\tTmp={template.Template}");
                            }
                        }
                    }

                    if (commandText.Length > 0)
                    {
                        var command = new ServerCommand
                        {
                            DeviceSerialNumber = serialNumber,
                            CommandText = commandText.ToString(),
                        };

                        _context.ServerCommands.Add(command);
                        await _context.SaveChangesAsync();

                        return Ok(new
                        {
                            Message = "Device updated successfully.",
                            UsersAdded = usersToAdd.Count,
                            UsersRemoved = usersToRemove.Count
                        });
                    }
                }
                else
                {
                    // If area is not changing, just update other properties
                    await _context.SaveChangesAsync();
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Devices.Any(e => e.SerialNumber == serialNumber))
                {
                    return NotFound("Device not found.");
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while updating the device: {ex.Message}");
            }

            return NoContent();
        }

        [HttpDelete("{serialNumber}")]
        public async Task<IActionResult> DeleteDevice(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            // Check if there are any pending commands TO this device (from server to device)
            var pendingCommandsTo = await _context.ServerCommands
                .Where(c => c.DeviceSerialNumber == serialNumber && !c.IsSent)
                .CountAsync();

            if (pendingCommandsTo > 0)
            {
                return BadRequest($"Cannot delete device {serialNumber}. There are {pendingCommandsTo} pending commands to this device. Clear all pending commands before deletion.");
            }

            // Ensure all data from the device has been synchronized to server
            // In typical ZKTeco systems, this means ensuring that any attendance records
            // or other data that might still be on the device gets transferred to our system
            // This happens automatically when devices connect and send data via the IClockController

            // Since we can't force the device to send its data immediately before deletion,
            // the best we can do here is make sure no pending commands are queued to the device
            // and that we don't lose any data that has already been received from the device

            // Clean up any related server commands (both sent and unsent)
            var allRelatedCommands = await _context.ServerCommands
                .Where(c => c.DeviceSerialNumber == serialNumber)
                .ToListAsync();

            _context.ServerCommands.RemoveRange(allRelatedCommands);

            // Remove the device
            _context.Devices.Remove(device);
            await _context.SaveChangesAsync();

            return Ok($"Device {serialNumber} deleted successfully. {allRelatedCommands.Count} related server commands were also removed.");
        }
    }
}
