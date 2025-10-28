using BioTime.Data;
using BioTime.Data.Models;
using BioTime.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.Globalization;

namespace BioTime.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly BioTimeDbContext _context;

        public UsersController(BioTimeDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UserCreateDto userDto)
        {
            if (userDto == null || string.IsNullOrWhiteSpace(userDto.Pin))
            {
                return BadRequest("User PIN is required.");
            }

            if (userDto.AreaIds == null || !userDto.AreaIds.Any())
            {
                return BadRequest("At least one AreaId is required.");
            }

            var user = new User
            {
                Pin = userDto.Pin,
                Name = userDto.Name,
                Password = userDto.Password,
                Privilege = userDto.Privilege,
                CardNumber = userDto.CardNumber
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(); // Save user to generate an ID

            // If areas are provided, link them to the user and queue commands for devices in those areas
            if (userDto.AreaIds != null && userDto.AreaIds.Any())
            {
                foreach (var areaId in userDto.AreaIds.Distinct())
                {
                    var area = await _context.Areas.FindAsync(areaId);
                    if (area != null)
                    {
                        var userArea = new UserArea { UserId = user.Id, AreaId = area.Id };
                        _context.UserAreas.Add(userArea);
                    }
                }
                await _context.SaveChangesAsync(); // Save the UserArea links

                // Find all devices that are in the areas the user was just assigned to
                var devicesToUpdate = await _context.Devices
                    .Where(d => d.AreaId.HasValue && userDto.AreaIds.Contains(d.AreaId.Value))
                    .ToListAsync();

                var commands = new List<ServerCommand>();
                long commandIdCounter = DateTime.UtcNow.Ticks;

                foreach (var device in devicesToUpdate)
                {
                    string commandText = $"C:{commandIdCounter++}:DATA UPDATE USERINFO PIN={user.Pin}\tName={user.Name ?? ""}\tPri={user.Privilege}\tCard={user.CardNumber ?? ""}";
                    commands.Add(new ServerCommand
                    {
                        DeviceSerialNumber = device.SerialNumber,
                        CommandText = commandText
                    });
                }

                if (commands.Any())
                {
                    _context.ServerCommands.AddRange(commands);
                    await _context.SaveChangesAsync();
                }
            }

            var createdUser = await _context.Users
                .Include(u => u.UserAreas)
                .FirstOrDefaultAsync(u => u.Id == user.Id);

            return CreatedAtAction(nameof(CreateUser), new { id = user.Id }, createdUser);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users
                .Include(u => u.UserAreas)
                .ToListAsync();
        }

        [HttpPut("{pin}")]
        public async Task<IActionResult> UpdateUser(string pin, [FromBody] User updatedUser)
        {
            if (pin != updatedUser.Pin)
            {
                return BadRequest("User PIN mismatch.");
            }

            _context.Entry(updatedUser).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Users.Any(e => e.Pin == pin))
                {
                    return NotFound("User not found.");
                }
                else
                {
                    throw;
                }
            }
            var updatedUserResult = await _context.Users
                .Include(u => u.UserAreas)
                .FirstOrDefaultAsync(u => u.Pin == pin);

            return Ok(updatedUserResult);
        }

        [HttpDelete("{pin}")]
        public async Task<IActionResult> DeleteUser(string pin)
        {
            var user = await _context.Users
                .Include(u => u.UserAreas)
                .FirstOrDefaultAsync(u => u.Pin == pin);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Find all devices that are in the areas the user is assigned to
            var areaIds = user.UserAreas.Select(ua => ua.AreaId).ToList();
            var devicesToUpdate = await _context.Devices
                .Where(d => d.AreaId.HasValue && areaIds.Contains(d.AreaId.Value))
                .ToListAsync();

            // Queue a delete command for each relevant device
            long commandIdCounter = DateTime.UtcNow.Ticks;
            var commands = new List<ServerCommand>();
            foreach (var device in devicesToUpdate)
            {
                string commandText = $"C:{commandIdCounter++}:DATA DELETE USERINFO PIN={user.Pin}";
                commands.Add(new ServerCommand
                {
                    DeviceSerialNumber = device.SerialNumber,
                    CommandText = commandText
                });
            }

            if (commands.Any())
            {
                _context.ServerCommands.AddRange(commands);
            }

            // Delete the user from the server's database
            _context.Users.Remove(user);

            await _context.SaveChangesAsync();

            return Ok($"User {pin} has been deleted from the server and delete commands have been queued for {devicesToUpdate.Count} device(s).");
        }

        [HttpPost("{pin}/areas")]
        public async Task<IActionResult> AssignUserToArea(string pin, [FromBody] UserAreaDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Pin == pin);
            if (user == null)
            {
                return NotFound("User not found.");
            }
            var area = await _context.Areas.FindAsync(dto.AreaId);
            if (area == null)
            {
                return NotFound("Area not found.");
            }
            var exists = await _context.UserAreas.AnyAsync(ua => ua.UserId == user.Id && ua.AreaId == area.Id);
            if (exists)
            {
                return Ok("User is already assigned to this area.");
            }
            var userArea = new UserArea { UserId = user.Id, AreaId = area.Id };
            _context.UserAreas.Add(userArea);
            await _context.SaveChangesAsync();
            return Ok("User successfully assigned to area.");
        }

        [HttpPut("{pin}/areas")]
        public async Task<IActionResult> UpdateUserAreas(string pin, [FromBody] UserAreaUpdateDto dto)
        {
            var user = await _context.Users.Include(u => u.UserAreas).FirstOrDefaultAsync(u => u.Pin == pin);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var currentAreaIds = user.UserAreas.Select(ua => ua.AreaId).ToHashSet();
            var newAreaIds = dto.AreaIds.ToHashSet();

            var removedAreaIds = currentAreaIds.Except(newAreaIds).ToList();
            var addedAreaIds = newAreaIds.Except(currentAreaIds).ToList();

            var commands = new List<ServerCommand>();
            long commandIdCounter = DateTime.UtcNow.Ticks;

            // 1. Handle removed areas -> Queue DELETE commands
            if (removedAreaIds.Any())
            {
                var devicesToRemoveFrom = await _context.Devices
                    .Where(d => d.AreaId.HasValue && removedAreaIds.Contains(d.AreaId.Value))
                    .ToListAsync();

                foreach (var device in devicesToRemoveFrom)
                {
                    string commandText = $"C:{commandIdCounter++}:DATA DELETE USERINFO PIN={user.Pin}";
                    commands.Add(new ServerCommand { DeviceSerialNumber = device.SerialNumber, CommandText = commandText });
                }
            }

            // 2. Handle added areas -> Queue UPDATE commands
            if (addedAreaIds.Any())
            {
                var devicesToAddTo = await _context.Devices
                    .Where(d => d.AreaId.HasValue && addedAreaIds.Contains(d.AreaId.Value))
                    .ToListAsync();

                foreach (var device in devicesToAddTo)
                {
                    string commandText = $"C:{commandIdCounter++}:DATA UPDATE USERINFO PIN={user.Pin}\tName={user.Name ?? ""}\tPri={user.Privilege}\tCard={user.CardNumber ?? ""}";
                    commands.Add(new ServerCommand { DeviceSerialNumber = device.SerialNumber, CommandText = commandText });
                }
            }

            // 3. Update the database links
            user.UserAreas.RemoveAll(ua => removedAreaIds.Contains(ua.AreaId));
            foreach (var areaId in addedAreaIds)
            {
                user.UserAreas.Add(new UserArea { UserId = user.Id, AreaId = areaId });
            }

            if (commands.Any())
            {
                _context.ServerCommands.AddRange(commands);
            }

            await _context.SaveChangesAsync();

            // Return the updated user with relationships
            var updatedUser = await _context.Users
                .Include(u => u.UserAreas)
                .FirstOrDefaultAsync(u => u.Pin == pin);

            return Ok(new
            {
                Message = $"User {pin} areas updated. Queued {commands.Count} commands.",
                User = updatedUser
            });
        }

        [HttpGet("{pin}/attendance-logs")]
        public async Task<ActionResult<IEnumerable<AttendanceLog>>> GetUserAttendanceLogs(string pin)
        {
            var attendanceLogs = await _context.AttendanceLogs
                .Where(log => log.Pin == pin)
                .OrderByDescending(log => log.Timestamp)
                .ToListAsync();

            return Ok(attendanceLogs);
        }

        [HttpGet("{pin}/fingerprints")]
        public async Task<ActionResult<IEnumerable<FingerprintTemplate>>> GetUserFingerprints(string pin)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Pin == pin);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var fingerprints = await _context.FingerprintTemplates
                .Where(ft => ft.UserId == user.Id)
                .ToListAsync();

            return Ok(fingerprints);
        }

        [HttpGet("{pin}/facetemplates")]
        public async Task<ActionResult<IEnumerable<FaceTemplate>>> GetUserFaceTemplates(string pin)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Pin == pin);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var faceTemplates = await _context.FaceTemplates
                .Where(ft => ft.Pin == pin) // <--- Changed from ft.UserId == user.Id
                .ToListAsync();

            return Ok(faceTemplates);
        }

        [HttpGet("{pin}/fingerveintemplates")]
        public async Task<ActionResult<IEnumerable<FingerVeinTemplate>>> GetUserFingerVeinTemplates(string pin)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Pin == pin);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var fingerVeinTemplates = await _context.FingerVeinTemplates
                .Where(fvt => fvt.Pin == pin) // <--- Changed from fvt.UserId == user.Id
                .ToListAsync();

            return Ok(fingerVeinTemplates);
        }

        [HttpGet("{pin}/unifiedtemplates")]
        public async Task<ActionResult<IEnumerable<UnifiedTemplate>>> GetUserUnifiedTemplates(string pin)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Pin == pin);
            if (user == null)
            {
                return NotFound("User not found.");
            }
            var unifiedTemplates = await _context.UnifiedTemplates
                .Where(ut => ut.Pin == pin)
                .ToListAsync();
            return Ok(unifiedTemplates);
        }

        [HttpGet("{pin}/attendance-report")]
        public async Task<ActionResult<AttendanceReportResponseDto>> GetUserAttendanceReport(string pin, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Pin == pin);
            if (user == null)
            {
                return NotFound("User not found.");
            }
            endDate = endDate.Date.AddDays(1).AddTicks(-1);
            var attendanceLogs = await _context.AttendanceLogs
                .Include(al => al.Device)
                .ThenInclude(d => d!.Area) // Include Area to get Zone information
                .Where(al => al.Pin == pin && al.Timestamp >= startDate && al.Timestamp <= endDate)
                .OrderBy(al => al.Timestamp)
                .ToListAsync();
            var report = new List<AttendanceReportDto>();
            for (DateTime date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
            {
                var dailyLogs = attendanceLogs.Where(al => al.Timestamp.Date == date).ToList();
                var reportEntry = new AttendanceReportDto
                {
                    Date = date
                };

                if (dailyLogs != null && dailyLogs.Any())
                {
                    var firstPunch = dailyLogs.Min(al => al.Timestamp);
                    var lastPunch = dailyLogs.Max(al => al.Timestamp);
                    reportEntry.InTime = firstPunch.ToString("hh\\:mm\\:ss tt", CultureInfo.InvariantCulture); // Format to 12-hour string
                    if (firstPunch != lastPunch)
                    {
                        reportEntry.OutTime = lastPunch.ToString("hh\\:mm\\:ss tt", CultureInfo.InvariantCulture); // Format to 12-hour string
                        TimeSpan workingHours = lastPunch - firstPunch;
                        reportEntry.WorkingHours = workingHours.ToString("hh\\:mm", CultureInfo.InvariantCulture); // Format to HH:mm
                    }
                    else
                    {
                        reportEntry.OutTime = null;
                        reportEntry.WorkingHours = TimeSpan.Zero.ToString("hh\\:mm", CultureInfo.InvariantCulture); // "00:00"
                    }
                    reportEntry.Zone = dailyLogs.FirstOrDefault()?.Device?.Area?.Name;
                }
                else
                {
                    reportEntry.AbsentLeaveReason = "Absent";
                }
                report.Add(reportEntry);
            }
            var totalWorkingHours = TimeSpan.Zero;
            var totalLateEntries = 0;
            var totalEarlyLeaves = 0;

            foreach (var entry in report)
            {
                if (!string.IsNullOrEmpty(entry.WorkingHours))
                {
                    TimeSpan entryWorkingHours = TimeSpan.ParseExact(entry.WorkingHours, "hh\\:mm", CultureInfo.InvariantCulture);
                    totalWorkingHours = totalWorkingHours.Add(entryWorkingHours);
                }
                if (entry.IsLateEntry)
                {
                    totalLateEntries++;
                }
                if (entry.IsEarlyLeave)
                {
                    totalEarlyLeaves++;
                }
            }

            return Ok(new AttendanceReportResponseDto
            {
                DailyReports = report,
                TotalWorkingHours = totalWorkingHours,
                TotalLateEntries = totalLateEntries,
                TotalEarlyLeaves = totalEarlyLeaves
            });
        }
    }
}