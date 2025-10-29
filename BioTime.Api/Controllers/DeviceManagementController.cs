using BioTime.Data;
using BioTime.Data.Models;
using BioTime.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace BioTime.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeviceManagementController : ControllerBase
    {
        private readonly BioTimeDbContext _context;

        public DeviceManagementController(BioTimeDbContext context)
        {
            _context = context;
        }

        [HttpPut("{serialNumber}/area")]
        public async Task<IActionResult> AssignDeviceToArea(string serialNumber, [FromBody] DeviceAreaDto dto)
        {
            var device = await _context.Devices
                .Include(d => d.Area) // Include the current area to see what it was before
                .FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            if (dto.AreaId == 0)
            {
                return BadRequest("AreaId is required.");
            }

            var area = await _context.Areas.FindAsync(dto.AreaId);
            if (area == null)
            {
                return NotFound("Area not found.");
            }

            // Get users who had access to the device via the old area
            var previousUserIds = new List<int>();
            if (device.AreaId.HasValue)
            {
                previousUserIds = await _context.UserAreas
                    .Where(ua => ua.AreaId == device.AreaId)
                    .Select(ua => ua.UserId)
                    .ToListAsync();
            }

            // Get users who will have access to the device via the new area
            var newUserIds = await _context.UserAreas
                .Where(ua => ua.AreaId == dto.AreaId)
                .Select(ua => ua.UserId)
                .ToListAsync();

            // Users to remove (had access before but don't have access after)
            var usersToRemove = previousUserIds.Except(newUserIds).ToList();
            
            // Users to add (don't have access before but will have access after)
            var usersToAdd = newUserIds.Except(previousUserIds).ToList();

            // Update the device's area
            device.AreaId = dto.AreaId;
            await _context.SaveChangesAsync();

            // Create commands for users to be removed
            var commands = new List<ServerCommand>();
            long commandIdCounter = DateTime.UtcNow.Ticks;

            // Add commands to remove users who lost access
            foreach (var userId in usersToRemove)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    string commandText = $"C:{commandIdCounter++}:DATA DELETE USERINFO PIN={user.Pin}";
                    commands.Add(new ServerCommand
                    {
                        DeviceSerialNumber = serialNumber,
                        CommandText = commandText
                    });

                    // Also remove biometric templates for this user
                    // Fingerprint templates
                    var fingerprintTemplates = await _context.FingerprintTemplates
                        .Where(ft => ft.UserId == userId)
                        .ToListAsync();
                    foreach (var template in fingerprintTemplates)
                    {
                        commandText = $"C:{commandIdCounter++}:DATA DELETE FINGERTMP PIN={user.Pin}\tFID={template.FingerIndex}";
                        commands.Add(new ServerCommand
                        {
                            DeviceSerialNumber = serialNumber,
                            CommandText = commandText
                        });
                    }

                    // Face templates
                    var faceTemplates = await _context.FaceTemplates
                        .Where(ft => ft.Pin == user.Pin)
                        .ToListAsync();
                    foreach (var template in faceTemplates)
                    {
                        commandText = $"C:{commandIdCounter++}:DATA DELETE FACE PIN={user.Pin}\tFID={template.FID}";
                        commands.Add(new ServerCommand
                        {
                            DeviceSerialNumber = serialNumber,
                            CommandText = commandText
                        });
                    }

                    // Finger Vein templates
                    var fingerVeinTemplates = await _context.FingerVeinTemplates
                        .Where(fvt => fvt.Pin == user.Pin)
                        .ToListAsync();
                    foreach (var template in fingerVeinTemplates)
                    {
                        commandText = $"C:{commandIdCounter++}:DATA DELETE FVEIN PIN={user.Pin}\tFID={template.FID}";
                        commands.Add(new ServerCommand
                        {
                            DeviceSerialNumber = serialNumber,
                            CommandText = commandText
                        });
                    }

                    // Unified templates
                    var unifiedTemplates = await _context.UnifiedTemplates
                        .Where(ut => ut.Pin == user.Pin)
                        .ToListAsync();
                    foreach (var template in unifiedTemplates)
                    {
                        commandText = $"C:{commandIdCounter++}:DATA DELETE BIODATA Pin={user.Pin}\tNo={template.No}";
                        commands.Add(new ServerCommand
                        {
                            DeviceSerialNumber = serialNumber,
                            CommandText = commandText
                        });
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
                    string commandText = $"C:{commandIdCounter++}:DATA UPDATE USERINFO PIN={user.Pin}\tName={user.Name ?? ""}\tPri={user.Privilege}\tCard={user.CardNumber ?? ""}";
                    commands.Add(new ServerCommand
                    {
                        DeviceSerialNumber = serialNumber,
                        CommandText = commandText
                    });

                    // Add fingerprint templates
                    var fingerprintTemplates = await _context.FingerprintTemplates
                        .Where(ft => ft.UserId == userId)
                        .ToListAsync();
                    foreach (var template in fingerprintTemplates)
                    {
                        commandText = $"C:{commandIdCounter++}:DATA UPDATE FINGERTMP PIN={user.Pin}\tFID={template.FingerIndex}\tSize={template.Size}\tValid={template.Valid}\tTMP={template.Template}";
                        commands.Add(new ServerCommand
                        {
                            DeviceSerialNumber = serialNumber,
                            CommandText = commandText
                        });
                    }

                    // Add face templates
                    var faceTemplates = await _context.FaceTemplates
                        .Where(ft => ft.Pin == user.Pin)
                        .ToListAsync();
                    foreach (var template in faceTemplates)
                    {
                        commandText = $"C:{commandIdCounter++}:DATA UPDATE FACE PIN={user.Pin}\tFID={template.FID}\tSize={template.Size}\tValid={template.Valid}\tTMP={template.Template}";
                        commands.Add(new ServerCommand
                        {
                            DeviceSerialNumber = serialNumber,
                            CommandText = commandText
                        });
                    }

                    // Add finger vein templates
                    var fingerVeinTemplates = await _context.FingerVeinTemplates
                        .Where(fvt => fvt.Pin == user.Pin)
                        .ToListAsync();
                    foreach (var template in fingerVeinTemplates)
                    {
                        commandText = $"C:{commandIdCounter++}:DATA UPDATE FVEIN PIN={user.Pin}\tFID={template.FID}\tIndex={template.Index}\tSize={template.Size}\tValid={template.Valid}\tTmp={template.Template}";
                        commands.Add(new ServerCommand
                        {
                            DeviceSerialNumber = serialNumber,
                            CommandText = commandText
                        });
                    }

                    // Add unified templates
                    var unifiedTemplates = await _context.UnifiedTemplates
                        .Where(ut => ut.Pin == user.Pin)
                        .ToListAsync();
                    foreach (var template in unifiedTemplates)
                    {
                        commandText = $"C:{commandIdCounter++}:DATA UPDATE BIODATA Pin={user.Pin}\tNo={template.No}\tIndex={template.Index}\tValid={template.Valid}\tDuress={template.Duress}\tType={template.Type}\tMajorVer={template.MajorVer}\tMinorVer={template.MinorVer}\tFormat={template.Format}\tTmp={template.Template}";
                        commands.Add(new ServerCommand
                        {
                            DeviceSerialNumber = serialNumber,
                            CommandText = commandText
                        });
                    }
                }
            }

            if (commands.Any())
            {
                _context.ServerCommands.AddRange(commands);
                await _context.SaveChangesAsync();
                
                return Ok($"Device area updated. Queued {commands.Count} commands to sync user access for {usersToAdd.Count} new users and remove access for {usersToRemove.Count} users.");
            }

            return Ok("Device area updated. No user access changes required.");
        }

        [HttpPost("{serialNumber}/sync-users")]
        public async Task<IActionResult> SyncUsersToDevice(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            if (device.AreaId == null)
            {
                return BadRequest("Device is not assigned to an area. Cannot sync users.");
            }

            var usersToSync = await _context.UserAreas
                .Where(ua => ua.AreaId == device.AreaId)
                .Select(ua => ua.User)
                .ToListAsync();

            if (!usersToSync.Any())
            {
                return Ok("No users found for this device's area.");
            }

            var commands = new List<ServerCommand>();
            long commandIdCounter = DateTime.UtcNow.Ticks;

            foreach (var user in usersToSync)
            {
                if (user != null)
                {
                    string commandText = $"C:{commandIdCounter++}:DATA UPDATE USERINFO PIN={user.Pin}\tName={user.Name ?? ""}\tPri={user.Privilege}\tCard={user.CardNumber ?? ""}";
                    
                    commands.Add(new ServerCommand
                    {
                        DeviceSerialNumber = serialNumber,
                        CommandText = commandText
                    });
                }
            }

            _context.ServerCommands.AddRange(commands);
            await _context.SaveChangesAsync();

            return Ok($"{commands.Count} user sync commands have been queued for device {serialNumber}.");
        }

        [HttpPost("enrollment/fingerprint")]
        public async Task<IActionResult> EnrollFingerprint([FromBody] FingerprintEnrollDto enrollDto)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == enrollDto.DeviceSerialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Pin == enrollDto.Pin);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText;

            if (!string.IsNullOrWhiteSpace(enrollDto.TemplateData))
            {
                // Scenario 1: Push existing template from backend to device
                commandText = $"C:{commandId}:DATA WRITE FINGERTMP PIN={enrollDto.Pin}\tFID={enrollDto.FingerIndex}\tTMP={enrollDto.TemplateData}\tOVERWRITE={(enrollDto.Overwrite ? 1 : 0)}";
            }
            else
            {
                // Scenario 2: Initiate enrollment on the device (device captures fingerprint)
                commandText = $"C:{commandId}:ENROLL_FP PIN={enrollDto.Pin}\tFID={enrollDto.FingerIndex}\tRETRY={enrollDto.RetryCount}\tOVERWRITE={(enrollDto.Overwrite ? 1 : 0)}";
            }

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = enrollDto.DeviceSerialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Fingerprint enrollment command queued for user {enrollDto.Pin} on device {enrollDto.DeviceSerialNumber}.");
        }

        [HttpPost("{serialNumber}/update-firmware")]
        public async Task<IActionResult> UpdateFirmware(string serialNumber, [FromQuery] string checksum, [FromQuery] string url, [FromQuery] string size)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:UPDATE checksum={checksum},url={url},size={size}";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Update firmware command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/execute-shell-command")]
        public async Task<IActionResult> ExecuteShellCommand(string serialNumber, [FromQuery] string command)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:SHELL {command}";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Execute shell command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/put-file")]
        public async Task<IActionResult> PutFile(string serialNumber, [FromQuery] string url, [FromQuery] string filePath)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:PutFile {url}\t{filePath}";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Put file command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/get-file")]
        public async Task<IActionResult> GetFile(string serialNumber, [FromQuery] string filePath)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:GetFile {filePath}";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Get file command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/reload-options")]
        public async Task<IActionResult> ReloadOptions(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:RELOAD OPTIONS";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Reload options command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/set-option")]
        public async Task<IActionResult> SetDeviceOption(string serialNumber, [FromQuery] string key, [FromQuery] string value)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:SET OPTION {key}={value}";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Set device option command queued for device {serialNumber}.");
        }

        [HttpGet("{serialNumber}/info")]
        public async Task<IActionResult> GetDeviceInfo(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:INFO";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Get device info command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/check-new-data")]
        public async Task<IActionResult> CheckAndTransmitNewData(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:LOG";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Check and transmit new data command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/check-update")]
        public async Task<IActionResult> CheckDataUpdate(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:CHECK";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Check data update command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/cancel-alarm")]
        public async Task<IActionResult> CancelAlarm(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:AC_UNALARM";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Cancel alarm command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/unlock")]
        public async Task<IActionResult> UnlockDoor(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:AC_UNLOCK";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Unlock door command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/reboot")]
        public async Task<IActionResult> RebootDevice(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:REBOOT";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Reboot command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/clear-biodata")]
        public async Task<IActionResult> ClearBioData(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:CLEAR BIODATA";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Clear biodata command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/clear-data")]
        public async Task<IActionResult> ClearData(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:CLEAR DATA";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Clear data command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/clear-att-photos")]
        public async Task<IActionResult> ClearAttendancePhotos(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:CLEAR PHOTO";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Clear attendance photos command queued for device {serialNumber}.");
        }

        [HttpPost("{serialNumber}/clear-att-logs")]
        public async Task<IActionResult> ClearAttendanceLogs(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            long commandId = DateTime.UtcNow.Ticks;
            string commandText = $"C:{commandId}:CLEAR LOG";

            var serverCommand = new ServerCommand
            {
                DeviceSerialNumber = serialNumber,
                CommandText = commandText
            };

            _context.ServerCommands.Add(serverCommand);
            await _context.SaveChangesAsync();

            return Ok($"Clear attendance logs command queued for device {serialNumber}.");
        }

        [HttpGet("{serialNumber}/pending-commands")]
        public async Task<IActionResult> GetPendingCommandsCount(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            var pendingCount = await _context.ServerCommands
                .Where(c => c.DeviceSerialNumber == serialNumber && !c.IsSent)
                .CountAsync();

            return Ok(new { PendingCommands = pendingCount });
        }
    }
}