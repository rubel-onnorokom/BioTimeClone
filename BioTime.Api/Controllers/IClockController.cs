using System;
using System.Collections.Generic; // Added for IEnumerable<string>
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BioTime.Data;
using BioTime.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using System.Security.Cryptography;

namespace BioTime.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class IClockController : ControllerBase
    {
        private readonly BioTimeDbContext _context;
        private static readonly RSA _serverRsa = RSA.Create(2048);

        public IClockController(BioTimeDbContext context)
        {
            _context = context;
        }

        [HttpPost("exchange")]
        public async Task<IActionResult> Exchange([FromQuery] string SN, [FromQuery] string type, [FromBody] string body)
        {
            if (string.IsNullOrEmpty(SN) || string.IsNullOrEmpty(type) || string.IsNullOrEmpty(body))
            {
                return BadRequest("Missing parameters.");
            }

            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == SN);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            if (type == "publickey")
            {
                device.PublicKey = body;
                device.IsEncryptionEnabled = true;
                await _context.SaveChangesAsync();

                var serverPublicKey = Convert.ToBase64String(_serverRsa.ExportRSAPublicKey());
                return Content($"PublicKey={serverPublicKey}", "text/plain");
            }
            else if (type == "factors")
            {
                // For now, we will just generate a random session key and send it back encrypted with the device's public key.
                // A proper implementation would use the exchanged factors to derive the session key.
                var sessionKey = new byte[16];
                using (var rng = RandomNumberGenerator.Create())
                {
                    rng.GetBytes(sessionKey);
                }
                device.SessionKey = Convert.ToBase64String(sessionKey);
                await _context.SaveChangesAsync();

                using (var rsa = RSA.Create())
                {
                    rsa.ImportRSAPublicKey(Convert.FromBase64String(device.PublicKey), out _);
                    var encryptedSessionKey = rsa.Encrypt(sessionKey, RSAEncryptionPadding.OaepSHA1);
                    return Content(Convert.ToBase64String(encryptedSessionKey), "text/plain");
                }
            }

            return BadRequest("Invalid type.");
        }

        // GET /iclock/cdata?SN=...
        [HttpGet("cdata")]
        public async Task<IActionResult> GetDeviceConfig([FromQuery] string SN, [FromQuery] string? options, [FromQuery] string? language, [FromQuery] string? pushver, [FromQuery] string? PushOptionsFlag)
        {
            if (string.IsNullOrEmpty(SN))
            {
                return Content("SN is required.", "text/plain");
            }

            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == SN);
            if (device == null)
            {
                device = new Device { Name = "Auto Add", SerialNumber = SN };
                _context.Devices.Add(device);
            }

            device.LastSeen = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(language))
            {
                device.Language = language;
            }

            if (!string.IsNullOrEmpty(pushver))
            {
                device.PushVersion = pushver;
            }

            if (!string.IsNullOrEmpty(PushOptionsFlag))
            {
                device.PushOptionsFlag = PushOptionsFlag;
            }

            await _context.SaveChangesAsync();

            var response = $"GET OPTION FROM: {SN}\n"
                           + $"Stamp=9999\n"
                           + $"OpStamp=9999\n"
                           + $"ErrorDelay={device.ErrorDelay}\n"
                           + $"Delay={device.Delay}\n"
                           + $"TransTimes={device.TransTimes}\n"
                           + $"TransInterval={device.TransInterval}\n"
                           + $"TransFlag={device.TransFlag}\n"
                           + $"Realtime={device.Realtime}\n"
                           + $"TimeZone={device.TimeZone}\n"
                           + $"Encrypt={(device.IsEncryptionEnabled ? 1 : 0)}\n";

            return Content(response, "text/plain");
        }

        // GET /iclock/getrequest?SN=...
        [HttpGet("getrequest")]
        public async Task<IActionResult> GetRequest([FromQuery] string SN, [FromQuery] string? INFO)
        {
            if (string.IsNullOrEmpty(SN))
            {
                return Content("SN is required.", "text/plain");
            }

            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == SN);
            if (device == null)
            {
                return Content("OK", "text/plain");
            }

            if (!string.IsNullOrEmpty(INFO))
            {
                var parts = INFO.Split(',');
                if (parts.Length >= 10)
                {
                    device.FirmwareVersion = parts[0].StartsWith("Ver ") ? parts[0].Substring(4) : parts[0];
                    device.UserCount = int.TryParse(parts[1], out int userCount) ? userCount : 0;
                    device.FingerprintCount = int.TryParse(parts[2], out int fingerprintCount) ? fingerprintCount : 0;
                    device.AttendanceRecordCount = int.TryParse(parts[3], out int attendanceRecordCount) ? attendanceRecordCount : 0;
                    device.IPAddress = parts[4];
                    device.FingerprintAlgorithmVersion = parts[5];
                    device.FaceAlgorithmVersion = parts[6];
                    device.RequiredFaceCount = int.TryParse(parts[7], out int requiredFaceCount) ? requiredFaceCount : 0;
                    device.FaceCount = int.TryParse(parts[8], out int faceCount) ? faceCount : 0;
                    device.SupportedFunctions = parts[9];
                }
            }

            var commands = await _context.ServerCommands
                .Where(c => c.DeviceSerialNumber == SN && !c.IsSent)
                .OrderBy(c => c.Id)
                .ToListAsync();

            string commandTextCombined = string.Join("\n", commands.Select(c => c.CommandText));

            _context.ServerCommands.RemoveRange(commands);

            if (string.IsNullOrEmpty(commandTextCombined))
            {
                return Content(commandTextCombined ?? "", "text/plain");
            }
            await _context.SaveChangesAsync();

            return Content("OK", "text/plain");
        }

        // POST /iclock/devicecmd?SN=...

        [HttpPost("devicecmd")]
        public async Task<IActionResult> DeviceCmd([FromQuery] string SN)
        {
            if (string.IsNullOrEmpty(SN))
            {
                return Content("SN is required.", "text/plain");
            }

            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();

            return Content("OK", "text/plain");
        }

        private async Task<int> ProcessLine(string line, Device device, BioTimeDbContext context)
        {
            string inferredTable = "UNKNOWN";
            if (line.StartsWith("USER ")) inferredTable = "USERINFO";
            else if (line.StartsWith("FP\t")) inferredTable = "FINGERTMP";
            else if (line.StartsWith("FACE ")) inferredTable = "FACE";
            else if (line.StartsWith("FVEIN ")) inferredTable = "FVEIN";
            else if (line.StartsWith("USERPIC ")) inferredTable = "USERPIC";
            else if (line.StartsWith("BIOPHOTO ")) inferredTable = "BIOPHOTO";
            else if (line.StartsWith("BIODATA ")) inferredTable = "BIODATA";
            else if (line.StartsWith("OPLOG ")) inferredTable = "OPERLOG";
            else if (line.Contains("FP PIN=")) inferredTable = "FINGERTMP";
            else inferredTable = "OPERLOG"; // Default to OPLOG for unknown prefixes

            return await ProcessDataRecords(inferredTable, new List<string> { line }, device, context);
        }

        [HttpPost("cdata")]
        public async Task<IActionResult> PostCData([FromQuery] string SN, [FromQuery] string table)
        {
            if (string.IsNullOrEmpty(SN))
            {
                return Content("SN is required.", "text/plain");
            }

            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == SN);
            if (device == null)
            {
                return Content("Device not found.", "text/plain");
            }

            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();
            int recordsProcessed = 0;

            if (table.ToUpper() == "OPERLOG")
            {
                var lines = body.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines)
                {
                    recordsProcessed += await ProcessLine(line, device, _context);
                }
            }
            else if (table.ToUpper() == "DATAPACKET")
            {
                try
                {
                    using (var compressedStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(body)))
                    using (var gzipStream = new GZipStream(compressedStream, CompressionMode.Decompress))
                    using (var gzipReader = new StreamReader(gzipStream))
                    {
                        var decompressedBody = await gzipReader.ReadToEndAsync();
                        var decompressedLines = decompressedBody.Split('\n', StringSplitOptions.RemoveEmptyEntries);

                        foreach (var line in decompressedLines)
                        {
                            recordsProcessed += await ProcessLine(line, device, _context);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error decompressing or processing DATAPACKET: {ex.Message}");
                    return Content("Error processing DATAPACKET", "text/plain");
                }
            }
            else
            {
                var lines = body.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                recordsProcessed = await ProcessDataRecords(table, lines, device, _context);
            }

            if (recordsProcessed > 0)
            {
                await _context.SaveChangesAsync();
            }

            return Content($"OK: {recordsProcessed}", "text/plain");
        }

        private async Task<int> ProcessDataRecords(string table, IEnumerable<string> lines, Device device, BioTimeDbContext context)
        {
            // Collect entities in lists for bulk insert
            var attendanceLogs = new List<AttendanceLog>();
            var operationLogs = new List<OperationLog>();
            var attendancePhotos = new List<AttendancePhoto>();
            var userInfos = new List<UserInfo>();
            var identityCards = new List<IdentityCard>();
            var identityCardAttendanceLogs = new List<IdentityCardAttendanceLog>();
            var identityCardAttendancePhotos = new List<IdentityCardAttendancePhoto>();
            var faceTemplates = new List<FaceTemplate>();
            var unifiedTemplates = new List<UnifiedTemplate>();
            var fingerVeinTemplates = new List<FingerVeinTemplate>();
            var userPhotos = new List<UserPhoto>();
            var comparisonPhotos = new List<ComparisonPhoto>();
            var errorLogs = new List<ErrorLog>();

            int recordsProcessed = 0;

            if (table.ToUpper() == "ATTLOG")
            {
                foreach (var line in lines)
                {
                    var fields = line.Trim().Split('\t');
                    if (fields.Length >= 6)
                    {
                        var log = new AttendanceLog
                        {
                            Pin = fields[0],
                            Timestamp = DateTime.ParseExact(fields[1], "yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture),
                            Status = int.Parse(fields[2]),
                            VerificationMode = int.Parse(fields[3]),
                            WorkCode = fields[4],
                            Reserved1 = fields[5],
                            Reserved2 = fields.Length > 6 ? fields[6] : null,
                            DeviceId = device.Id
                        };
                        attendanceLogs.Add(log);
                        recordsProcessed++;
                    }
                }

                // Bulk insert all attendance logs
                if (attendanceLogs.Count > 0)
                {
                    context.AttendanceLogs.AddRange(attendanceLogs);
                }
            }
            else if (table.ToUpper() == "OPERLOG")
            {
                foreach (var line in lines)
                {
                    var trimmedLine = line.Trim();
                    if (trimmedLine.StartsWith("OPLOG"))
                    {
                        var parts = trimmedLine.Substring(5).Trim().Split('\t');
                        if (parts.Length >= 3)
                        {
                            var log = new OperationLog
                            {
                                DeviceId = device.Id,
                                OperationType = int.Parse(parts[0]),
                                Operator = parts[1],
                                Timestamp = DateTime.ParseExact(parts[2], "yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture),
                                Operand1 = parts.Length > 3 ? parts[3] : null,
                                Operand2 = parts.Length > 4 ? parts[4] : null,
                                Operand3 = parts.Length > 5 ? parts[5] : null,
                                Reserved = parts.Length > 6 ? parts[6] : null,
                            };
                            operationLogs.Add(log);
                            recordsProcessed++;
                        }
                    }
                }

                // Bulk insert all operation logs
                if (operationLogs.Count > 0)
                {
                    context.OperationLogs.AddRange(operationLogs);
                }
            }
            else if (table.ToUpper() == "ATTPHOTO")
            {
                string? pin = null;
                string? sn = null;
                int size = 0;
                string? cmd = null;
                string? binaryData = null;

                foreach (var line in lines)
                {
                    // For ATTPHOTO, lines refer to the single record's multi-line content.
                    if (line.StartsWith("PIN=")) pin = line.Substring(4);
                    else if (line.StartsWith("SN=")) sn = line.Substring(3);
                    else if (line.StartsWith("size=")) int.TryParse(line.Substring(5), out size);
                    else if (line.StartsWith("CMD=")) cmd = line.Substring(4);
                    else if (line.Contains('\0')) binaryData = line.Substring(line.IndexOf('\0') + 1); // Binary data
                    else if (line.StartsWith("\x0")) binaryData = line.Substring(3); // Handle specific NUL representation if needed
                }

                // Assuming NUL byte or specific prefix in the raw body marks the start of binary data
                // For simplicity, let's say the last part after all key-value pairs is PhotoData
                // This might need refinement based on exact protocol implementation details for binary data

                if (!string.IsNullOrEmpty(pin) && !string.IsNullOrEmpty(sn) && !string.IsNullOrEmpty(binaryData))
                {
                    var photo = new AttendancePhoto
                    {
                        Pin = pin,
                        FileName = $"{pin}-{DateTime.UtcNow.ToString("yyyyMMddHHmmss")}.jpg", // Generate a filename
                        PhotoType = 0, // Assuming 0 for attendance successful photo based on PDF
                        Size = size,
                        PhotoData = binaryData,
                        DeviceId = device.Id
                    };
                    attendancePhotos.Add(photo);
                    recordsProcessed++;
                }

                // Bulk insert attendance photo
                if (attendancePhotos.Count > 0)
                {
                    context.AttendancePhotos.AddRange(attendancePhotos);
                }
            }
            else if (table.ToUpper() == "USERINFO")
            {
                foreach (var line in lines)
                {
                    var trimmedLine = line.Trim();
                    if (trimmedLine.StartsWith("USER"))
                    {
                        var parts = trimmedLine.Substring(4).Trim().Split('\t');
                        var userInfo = new UserInfo
                        {
                            Pin = parts.FirstOrDefault(p => p.StartsWith("PIN="))?.Split('=')[1],
                            Name = parts.FirstOrDefault(p => p.StartsWith("Name="))?.Split('=')[1],
                            Privilege = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Pri="))?.Split('=')[1] ?? "0"),
                            Password = parts.FirstOrDefault(p => p.StartsWith("Passwd="))?.Split('=')[1],
                            CardNumber = parts.FirstOrDefault(p => p.StartsWith("Card="))?.Split('=')[1],
                            Group = parts.FirstOrDefault(p => p.StartsWith("Grp="))?.Split('=')[1],
                            TimeZone = parts.FirstOrDefault(p => p.StartsWith("TZ="))?.Split('=')[1],
                            Verify = parts.FirstOrDefault(p => p.StartsWith("Verify="))?.Split('=')[1],
                            ViceCard = parts.FirstOrDefault(p => p.StartsWith("ViceCard="))?.Split('=')[1],
                            DeviceId = device.Id
                        };
                        userInfos.Add(userInfo);
                        recordsProcessed++;
                    }
                }

                // Bulk insert all user info
                if (userInfos.Count > 0)
                {
                    context.UserInfos.AddRange(userInfos);
                }
            }
            else if (table.ToUpper() == "IDCARD")
            {
                foreach (var line in lines)
                {
                    var trimmedLine = line.Trim();
                    if (trimmedLine.StartsWith("IDCARD"))
                    {
                        var parts = trimmedLine.Substring(6).Trim().Split('\t');
                        var identityCard = new IdentityCard
                        {
                            Pin = parts.FirstOrDefault(p => p.StartsWith("PIN="))?.Split('=')[1],
                            SNNum = parts.FirstOrDefault(p => p.StartsWith("SNNum="))?.Split('=')[1],
                            IDNum = parts.FirstOrDefault(p => p.StartsWith("IDNum="))?.Split('=')[1],
                            DNNum = parts.FirstOrDefault(p => p.StartsWith("DNNum="))?.Split('=')[1],
                            Name = parts.FirstOrDefault(p => p.StartsWith("Name="))?.Split('=')[1],
                            Gender = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Gender="))?.Split('=')[1] ?? "0"),
                            Nation = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Nation="))?.Split('=')[1] ?? "0"),
                            Birthday = DateTime.ParseExact(parts.FirstOrDefault(p => p.StartsWith("Birthday="))?.Split('=')[1] ?? "19000101", "yyyyMMdd", CultureInfo.InvariantCulture),
                            ValidInfo = parts.FirstOrDefault(p => p.StartsWith("Valid="))?.Split('=')[1],
                            Address = parts.FirstOrDefault(p => p.StartsWith("Address="))?.Split('=')[1],
                            AdditionalInfo = parts.FirstOrDefault(p => p.StartsWith("AdditionalInfo="))?.Split('=')[1],
                            Issuer = parts.FirstOrDefault(p => p.StartsWith("Issuer="))?.Split('=')[1],
                            Photo = parts.FirstOrDefault(p => p.StartsWith("Photo="))?.Split('=')[1],
                            FPTemplate1 = parts.FirstOrDefault(p => p.StartsWith("FPTemplate1="))?.Split('=')[1],
                            FPTemplate2 = parts.FirstOrDefault(p => p.StartsWith("FPTemplate2="))?.Split('=')[1],
                            Reserve = parts.FirstOrDefault(p => p.StartsWith("Reserve="))?.Split('=')[1],
                            Notice = parts.FirstOrDefault(p => p.StartsWith("Notice="))?.Split('=')[1],
                            DeviceId = device.Id
                        };
                        identityCards.Add(identityCard);
                        recordsProcessed++;
                    }
                }

                // Bulk insert all identity cards
                if (identityCards.Count > 0)
                {
                    context.IdentityCards.AddRange(identityCards);
                }
            }
            else if (table.ToUpper() == "IDCARDATTLOG")
            {
                foreach (var line in lines)
                {
                    var fields = line.Trim().Split('\t');
                    if (fields.Length >= 9)
                    {
                        var log = new IdentityCardAttendanceLog
                        {
                            Pin = fields[0].Split('=')[1],
                            Timestamp = DateTime.ParseExact(fields[1].Split('=')[1], "yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture),
                            Status = int.Parse(fields[2].Split('=')[1]),
                            VerificationMode = int.Parse(fields[3].Split('=')[1]),
                            WorkCode = fields[4].Split('=')[1],
                            Reserved1 = fields[5].Split('=')[1],
                            Reserved2 = fields[6].Split('=')[1],
                            IDNum = fields[7].Split('=')[1],
                            Type = int.Parse(fields[8].Split('=')[1]),
                            DeviceId = device.Id
                        };
                        identityCardAttendanceLogs.Add(log);
                        recordsProcessed++;
                    }
                }

                // Bulk insert all identity card attendance logs
                if (identityCardAttendanceLogs.Count > 0)
                {
                    context.IdentityCardAttendanceLogs.AddRange(identityCardAttendanceLogs);
                }
            }
            else if (table.ToUpper() == "IDCARDATTPHOTO")
            {
                string? pin = null;
                string? sn = null;
                int size = 0;
                string? cmd = null;
                string? binaryData = null;

                foreach (var line in lines)
                {
                    if (line.StartsWith("PIN=")) pin = line.Substring(4);
                    else if (line.StartsWith("SN=")) sn = line.Substring(3);
                    else if (line.StartsWith("size=")) int.TryParse(line.Substring(5), out size);
                    else if (line.StartsWith("CMD=")) cmd = line.Substring(4);
                    else if (line.Contains('\0')) binaryData = line.Substring(line.IndexOf('\0') + 1); // Binary data
                    else if (line.StartsWith("\x0")) binaryData = line.Substring(3); // Handle specific NUL representation if needed
                }

                if (!string.IsNullOrEmpty(pin) && !string.IsNullOrEmpty(sn) && !string.IsNullOrEmpty(binaryData))
                {
                    var photo = new IdentityCardAttendancePhoto
                    {
                        Pin = pin,
                        FileName = $"{pin}-{DateTime.UtcNow.ToString("yyyyMMddHHmmss")}.jpg", // Generate a filename
                        PhotoType = 0, // Assuming 0 for attendance successful photo based on PDF
                        Size = size,
                        PhotoData = binaryData,
                        DeviceId = device.Id
                    };
                    identityCardAttendancePhotos.Add(photo);
                    recordsProcessed++;
                }

                // Bulk insert identity card attendance photos
                if (identityCardAttendancePhotos.Count > 0)
                {
                    context.IdentityCardAttendancePhotos.AddRange(identityCardAttendancePhotos);
                }
            }
            else if (table.ToUpper() == "FACE")
            {
                foreach (var line in lines)
                {
                    var trimmedLine = line.Trim();
                    if (trimmedLine.StartsWith("FACE"))
                    {
                        var parts = trimmedLine.Substring(4).Trim().Split('\t');
                        var faceTemplate = new FaceTemplate
                        {
                            Pin = parts.FirstOrDefault(p => p.StartsWith("PIN="))?.Split('=')[1],
                            FID = int.Parse(parts.FirstOrDefault(p => p.StartsWith("FID="))?.Split('=')[1] ?? "0"),
                            Size = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Size="))?.Split('=')[1] ?? "0"),
                            Valid = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Valid="))?.Split('=')[1] ?? "0"),
                            Template = parts.FirstOrDefault(p => p.StartsWith("TMP="))?.Split('=')[1],
                            DeviceId = device.Id
                        };
                        faceTemplates.Add(faceTemplate);
                        recordsProcessed++;
                    }
                }

                // Bulk insert all face templates
                if (faceTemplates.Count > 0)
                {
                    context.FaceTemplates.AddRange(faceTemplates);

                    // Generate sync commands for all devices the users have access to
                    await GenerateBiometricSyncCommands(context, faceTemplates, device.SerialNumber);
                }
            }
            else if (table.ToUpper() == "BIODATA")
            {
                foreach (var line in lines)
                {
                    var trimmedLine = line.Trim();
                    if (trimmedLine.StartsWith("BIODATA"))
                    {
                        var parts = trimmedLine.Substring(7).Trim().Split('\t');
                        var unifiedTemplate = new UnifiedTemplate
                        {
                            Pin = parts.FirstOrDefault(p => p.StartsWith("Pin="))?.Split('=')[1],
                            No = int.Parse(parts.FirstOrDefault(p => p.StartsWith("No="))?.Split('=')[1] ?? "0"),
                            Index = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Index="))?.Split('=')[1] ?? "0"),
                            Valid = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Valid="))?.Split('=')[1] ?? "0"),
                            Duress = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Duress="))?.Split('=')[1] ?? "0"),
                            Type = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Type="))?.Split('=')[1] ?? "0"),
                            MajorVer = int.Parse(parts.FirstOrDefault(p => p.StartsWith("MajorVer="))?.Split('=')[1] ?? "0"),
                            MinorVer = int.Parse(parts.FirstOrDefault(p => p.StartsWith("MinorVer="))?.Split('=')[1] ?? "0"),
                            Format = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Format="))?.Split('=')[1] ?? "0"),
                            Template = parts.FirstOrDefault(p => p.StartsWith("Tmp="))?.Split('=')[1],
                            DeviceId = device.Id
                        };
                        unifiedTemplates.Add(unifiedTemplate);
                        recordsProcessed++;
                    }
                }

                // Bulk insert all unified templates
                if (unifiedTemplates.Count > 0)
                {
                    context.UnifiedTemplates.AddRange(unifiedTemplates);

                    // Generate sync commands for all devices the users have access to
                    await GenerateBiometricSyncCommands(context, unifiedTemplates, device.SerialNumber);
                }
            }
            else if (table.ToUpper() == "FVEIN")
            {
                foreach (var line in lines)
                {
                    var trimmedLine = line.Trim();
                    if (trimmedLine.StartsWith("FVEIN"))
                    {
                        var parts = trimmedLine.Substring(5).Trim().Split('\t');
                        var fingerVeinTemplate = new FingerVeinTemplate
                        {
                            Pin = parts.FirstOrDefault(p => p.StartsWith("Pin="))?.Split('=')[1],
                            FID = int.Parse(parts.FirstOrDefault(p => p.StartsWith("FID="))?.Split('=')[1] ?? "0"),
                            Index = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Index="))?.Split('=')[1] ?? "0"),
                            Size = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Size="))?.Split('=')[1] ?? "0"),
                            Valid = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Valid="))?.Split('=')[1] ?? "0"),
                            Template = parts.FirstOrDefault(p => p.StartsWith("Tmp="))?.Split('=')[1],
                            DeviceId = device.Id
                        };
                        fingerVeinTemplates.Add(fingerVeinTemplate);
                        recordsProcessed++;
                    }
                }

                // Bulk insert all finger vein templates
                if (fingerVeinTemplates.Count > 0)
                {
                    context.FingerVeinTemplates.AddRange(fingerVeinTemplates);

                    // Generate sync commands for all devices the users have access to
                    await GenerateBiometricSyncCommands(context, fingerVeinTemplates, device.SerialNumber);
                }
            }
            else if (table.ToUpper() == "USERPIC")
            {
                foreach (var line in lines)
                {
                    var trimmedLine = line.Trim();
                    if (trimmedLine.StartsWith("USERPIC"))
                    {
                        var parts = trimmedLine.Substring(7).Trim().Split('\t');
                        var userPhoto = new UserPhoto
                        {
                            Pin = parts.FirstOrDefault(p => p.StartsWith("PIN="))?.Split('=')[1],
                            FileName = parts.FirstOrDefault(p => p.StartsWith("FileName="))?.Split('=')[1],
                            Size = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Size="))?.Split('=')[1] ?? "0"),
                            PhotoData = parts.FirstOrDefault(p => p.StartsWith("Content="))?.Split('=')[1],
                            DeviceId = device.Id
                        };
                        userPhotos.Add(userPhoto);
                        recordsProcessed++;
                    }
                }

                // Bulk insert all user photos
                if (userPhotos.Count > 0)
                {
                    context.UserPhotos.AddRange(userPhotos);
                }
            }
            else if (table.ToUpper() == "BIOPHOTO")
            {
                foreach (var line in lines)
                {
                    var trimmedLine = line.Trim();
                    if (trimmedLine.StartsWith("BIOPHOTO"))
                    {
                        var parts = trimmedLine.Substring(8).Trim().Split('\t');
                        var comparisonPhoto = new ComparisonPhoto
                        {
                            Pin = parts.FirstOrDefault(p => p.StartsWith("PIN="))?.Split('=')[1],
                            FileName = parts.FirstOrDefault(p => p.StartsWith("FileName="))?.Split('=')[1],
                            Type = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Type="))?.Split('=')[1] ?? "0"),
                            Size = int.Parse(parts.FirstOrDefault(p => p.StartsWith("Size="))?.Split('=')[1] ?? "0"),
                            PhotoData = parts.FirstOrDefault(p => p.StartsWith("Content="))?.Split('=')[1],
                            DeviceId = device.Id
                        };
                        comparisonPhotos.Add(comparisonPhoto);
                        recordsProcessed++;
                    }
                }

                // Bulk insert all comparison photos
                if (comparisonPhotos.Count > 0)
                {
                    context.ComparisonPhotos.AddRange(comparisonPhotos);
                }
            }
            else if (table.ToUpper() == "ERRORLOG")
            {
                foreach (var line in lines)
                {
                    var trimmedLine = line.Trim();
                    if (trimmedLine.StartsWith("ERRORLOG"))
                    {
                        var parts = trimmedLine.Substring(8).Trim().Split('\t');
                        var errorLog = new ErrorLog
                        {
                            ErrCode = parts.FirstOrDefault(p => p.StartsWith("ErrCode="))?.Split('=')[1],
                            ErrMsg = parts.FirstOrDefault(p => p.StartsWith("ErrMsg="))?.Split('=')[1],
                            DataOrigin = parts.FirstOrDefault(p => p.StartsWith("DataOrigin="))?.Split('=')[1],
                            CmdId = parts.FirstOrDefault(p => p.StartsWith("CmdId="))?.Split('=')[1],
                            Additional = parts.FirstOrDefault(p => p.StartsWith("Additional="))?.Split('=')[1],
                            DeviceId = device.Id
                        };
                        errorLogs.Add(errorLog);
                        recordsProcessed++;
                    }
                }

                // Bulk insert all error logs
                if (errorLogs.Count > 0)
                {
                    context.ErrorLogs.AddRange(errorLogs);
                }
            }
            else if (table.ToUpper() == "FINGERTMP")
            {
                var fingerprintTemplates = new List<FingerprintTemplate>();

                // First, collect all unique PINs to query users in bulk
                var allPins = new HashSet<string>();
                foreach (var line in lines)
                {
                    var parts = line.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var part in parts)
                    {
                        var kv = part.Split('=', 2);
                        if (kv.Length == 2 && kv[0] == "PIN")
                        {
                            allPins.Add(kv[1]);
                            break;
                        }
                    }
                }

                // Query users in bulk
                var users = await context.Users.Where(u => allPins.Contains(u.Pin)).ToListAsync();
                var userLookup = users.ToDictionary(u => u.Pin);

                // Process each line and create fingerprint templates
                foreach (var line in lines)
                {
                    var parts = line.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
                    string? pin = null;
                    int fid = -1;
                    int size = 0;
                    int valid = 0;
                    string? template = null;

                    foreach (var part in parts)
                    {
                        var kv = part.Split('=', 2);
                        if (kv.Length == 2)
                        {
                            switch (kv[0])
                            {
                                case "PIN":
                                    pin = kv[1];
                                    break;
                                case "FID":
                                    int.TryParse(kv[1], out fid);
                                    break;
                                case "Size":
                                    int.TryParse(kv[1], out size);
                                    break;
                                case "Valid":
                                    int.TryParse(kv[1], out valid);
                                    break;
                                case "TMP":
                                    template = kv[1];
                                    break;
                            }
                        }
                    }

                    if (!string.IsNullOrEmpty(pin) && !string.IsNullOrEmpty(template) && userLookup.ContainsKey(pin))
                    {
                        var newTemplate = new FingerprintTemplate
                        {
                            UserId = userLookup[pin].Id,
                            FingerIndex = fid,
                            Size = size,
                            Valid = valid,
                            Template = template
                        };
                        fingerprintTemplates.Add(newTemplate);
                        recordsProcessed++;
                    }
                }

                // Bulk insert all fingerprint templates
                if (fingerprintTemplates.Count > 0)
                {
                    context.FingerprintTemplates.AddRange(fingerprintTemplates);

                    // Generate sync commands for all devices the users have access to
                    await GenerateBiometricSyncCommands(context, fingerprintTemplates, device.SerialNumber);
                }
            }

            return recordsProcessed;
        }

        // This method is kept for potential reuse, but for bulk operations, 
        // see the updated FINGERTMP handling in ProcessDataRecords method which is more efficient
        private async Task<int> ProcessFingerprintTemplate(string line, BioTimeDbContext context)
        {
            var parts = line.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
            string? pin = null;
            int fid = -1;
            int size = 0;
            int valid = 0;
            string? template = null;

            foreach (var part in parts)
            {
                var kv = part.Split('=', 2);
                if (kv.Length == 2)
                {
                    switch (kv[0])
                    {
                        case "PIN":
                            pin = kv[1];
                            break;
                        case "FID":
                            int.TryParse(kv[1], out fid);
                            break;
                        case "Size":
                            int.TryParse(kv[1], out size);
                            break;
                        case "Valid":
                            int.TryParse(kv[1], out valid);
                            break;
                        case "TMP":
                            template = kv[1];
                            break;
                    }
                }
            }

            if (!string.IsNullOrEmpty(pin) && !string.IsNullOrEmpty(template))
            {
                var user = await context.Users.FirstOrDefaultAsync(u => u.Pin == pin);
                if (user != null)
                {
                    var newTemplate = new FingerprintTemplate
                    {
                        UserId = user.Id,
                        FingerIndex = fid,
                        Size = size,
                        Valid = valid,
                        Template = template
                    };
                    context.FingerprintTemplates.Add(newTemplate);
                    return 1;
                }
            }

            return 0;
        }

        /// <summary>
        /// Generates sync commands for biometric templates to all devices the users have access to
        /// </summary>
        /// <param name="context">Database context</param>
        /// <param name="templates">Collection of fingerprint templates</param>
        /// <param name="sourceDeviceSerialNumber">Serial number of the device that sent the data</param>
        private async Task GenerateBiometricSyncCommands(BioTimeDbContext context, List<FingerprintTemplate> templates, string sourceDeviceSerialNumber)
        {
            // Get all unique user IDs from the templates
            var userIds = templates.Select(t => t.UserId).Distinct().ToList();
            if (!userIds.Any()) return;

            // Get all area IDs these users have access to
            var userAreaIds = await context.UserAreas
                .Where(ua => userIds.Contains(ua.UserId))
                .Select(ua => ua.AreaId)
                .Distinct()
                .ToListAsync();

            if (!userAreaIds.Any()) return;

            // Get all devices in these areas (excluding the source device)
            var devicesToUpdate = await context.Devices
                .Where(d => d.AreaId.HasValue &&
                           userAreaIds.Contains(d.AreaId.Value) &&
                           d.SerialNumber != sourceDeviceSerialNumber)
                .ToListAsync();

            if (!devicesToUpdate.Any()) return;

            // Get user PINs for all users
            var userPins = await context.Users
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Pin);

            // Generate commands for each device
            var commands = new List<ServerCommand>();
            long commandIdCounter = DateTime.UtcNow.Ticks;

            foreach (var device in devicesToUpdate)
            {
                // Generate commands for each template
                foreach (var template in templates)
                {
                    if (userPins.TryGetValue(template.UserId, out string? pin) && !string.IsNullOrEmpty(pin))
                    {
                        string commandText = $"C:{commandIdCounter++}:DATA UPDATE FINGERTMP PIN={pin}\tFID={template.FingerIndex}\tSize={template.Size}\tValid={template.Valid}\tTMP={template.Template}";

                        commands.Add(new ServerCommand
                        {
                            DeviceSerialNumber = device.SerialNumber,
                            CommandText = commandText
                        });
                    }
                }
            }

            // Add all commands to database
            if (commands.Any())
            {
                context.ServerCommands.AddRange(commands);
            }
        }

        /// <summary>
        /// Generates sync commands for face templates to all devices the users have access to
        /// </summary>
        /// <param name="context">Database context</param>
        /// <param name="templates">Collection of face templates</param>
        /// <param name="sourceDeviceSerialNumber">Serial number of the device that sent the data</param>
        private async Task GenerateBiometricSyncCommands(BioTimeDbContext context, List<FaceTemplate> templates, string sourceDeviceSerialNumber)
        {
            // Get all unique PINs from the templates
            var pins = templates.Select(t => t.Pin).Where(p => !string.IsNullOrEmpty(p)).Distinct().ToList();
            if (!pins.Any()) return;

            // Get user IDs for these PINs
            var users = await context.Users
                .Where(u => pins.Contains(u.Pin))
                .ToDictionaryAsync(u => u.Pin, u => u.Id);

            var userIds = users.Values.ToList();
            if (!userIds.Any()) return;

            // Get all area IDs these users have access to
            var userAreaIds = await context.UserAreas
                .Where(ua => userIds.Contains(ua.UserId))
                .Select(ua => ua.AreaId)
                .Distinct()
                .ToListAsync();

            if (!userAreaIds.Any()) return;

            // Get all devices in these areas (excluding the source device)
            var devicesToUpdate = await context.Devices
                .Where(d => d.AreaId.HasValue &&
                           userAreaIds.Contains(d.AreaId.Value) &&
                           d.SerialNumber != sourceDeviceSerialNumber)
                .ToListAsync();

            if (!devicesToUpdate.Any()) return;

            // Generate commands for each device
            var commands = new List<ServerCommand>();
            long commandIdCounter = DateTime.UtcNow.Ticks;

            foreach (var device in devicesToUpdate)
            {
                // Generate commands for each template
                foreach (var template in templates)
                {
                    if (!string.IsNullOrEmpty(template.Pin))
                    {
                        string commandText = $"C:{commandIdCounter++}:DATA UPDATE FACE PIN={template.Pin}\tFID={template.FID}\tSize={template.Size}\tValid={template.Valid}\tTMP={template.Template}";

                        commands.Add(new ServerCommand
                        {
                            DeviceSerialNumber = device.SerialNumber,
                            CommandText = commandText
                        });
                    }
                }
            }

            // Add all commands to database
            if (commands.Any())
            {
                context.ServerCommands.AddRange(commands);
            }
        }

        /// <summary>
        /// Generates sync commands for finger vein templates to all devices the users have access to
        /// </summary>
        /// <param name="context">Database context</param>
        /// <param name="templates">Collection of finger vein templates</param>
        /// <param name="sourceDeviceSerialNumber">Serial number of the device that sent the data</param>
        private async Task GenerateBiometricSyncCommands(BioTimeDbContext context, List<FingerVeinTemplate> templates, string sourceDeviceSerialNumber)
        {
            // Get all unique PINs from the templates
            var pins = templates.Select(t => t.Pin).Where(p => !string.IsNullOrEmpty(p)).Distinct().ToList();
            if (!pins.Any()) return;

            // Get user IDs for these PINs
            var users = await context.Users
                .Where(u => pins.Contains(u.Pin))
                .ToDictionaryAsync(u => u.Pin, u => u.Id);

            var userIds = users.Values.ToList();
            if (!userIds.Any()) return;

            // Get all area IDs these users have access to
            var userAreaIds = await context.UserAreas
                .Where(ua => userIds.Contains(ua.UserId))
                .Select(ua => ua.AreaId)
                .Distinct()
                .ToListAsync();

            if (!userAreaIds.Any()) return;

            // Get all devices in these areas (excluding the source device)
            var devicesToUpdate = await context.Devices
                .Where(d => d.AreaId.HasValue &&
                           userAreaIds.Contains(d.AreaId.Value) &&
                           d.SerialNumber != sourceDeviceSerialNumber)
                .ToListAsync();

            if (!devicesToUpdate.Any()) return;

            // Generate commands for each device
            var commands = new List<ServerCommand>();
            long commandIdCounter = DateTime.UtcNow.Ticks;

            foreach (var device in devicesToUpdate)
            {
                // Generate commands for each template
                foreach (var template in templates)
                {
                    if (!string.IsNullOrEmpty(template.Pin))
                    {
                        string commandText = $"C:{commandIdCounter++}:DATA UPDATE FVEIN PIN={template.Pin}\tFID={template.FID}\tIndex={template.Index}\tSize={template.Size}\tValid={template.Valid}\tTmp={template.Template}";

                        commands.Add(new ServerCommand
                        {
                            DeviceSerialNumber = device.SerialNumber,
                            CommandText = commandText
                        });
                    }
                }
            }

            // Add all commands to database
            if (commands.Any())
            {
                context.ServerCommands.AddRange(commands);
            }
        }

        /// <summary>
        /// Generates sync commands for unified templates to all devices the users have access to
        /// </summary>
        /// <param name="context">Database context</param>
        /// <param name="templates">Collection of unified templates</param>
        /// <param name="sourceDeviceSerialNumber">Serial number of the device that sent the data</param>
        private async Task GenerateBiometricSyncCommands(BioTimeDbContext context, List<UnifiedTemplate> templates, string sourceDeviceSerialNumber)
        {
            // Get all unique PINs from the templates
            var pins = templates.Select(t => t.Pin).Where(p => !string.IsNullOrEmpty(p)).Distinct().ToList();
            if (!pins.Any()) return;

            // Get user IDs for these PINs
            var users = await context.Users
                .Where(u => pins.Contains(u.Pin))
                .ToDictionaryAsync(u => u.Pin, u => u.Id);

            var userIds = users.Values.ToList();
            if (!userIds.Any()) return;

            // Get all area IDs these users have access to
            var userAreaIds = await context.UserAreas
                .Where(ua => userIds.Contains(ua.UserId))
                .Select(ua => ua.AreaId)
                .Distinct()
                .ToListAsync();

            if (!userAreaIds.Any()) return;

            // Get all devices in these areas (excluding the source device)
            var devicesToUpdate = await context.Devices
                .Where(d => d.AreaId.HasValue &&
                           userAreaIds.Contains(d.AreaId.Value) &&
                           d.SerialNumber != sourceDeviceSerialNumber)
                .ToListAsync();

            if (!devicesToUpdate.Any()) return;

            // Generate commands for each device
            var commands = new List<ServerCommand>();
            long commandIdCounter = DateTime.UtcNow.Ticks;

            foreach (var device in devicesToUpdate)
            {
                // Generate commands for each template
                foreach (var template in templates)
                {
                    if (!string.IsNullOrEmpty(template.Pin))
                    {
                        string commandText = $"C:{commandIdCounter++}:DATA UPDATE BIODATA Pin={template.Pin}\tNo={template.No}\tIndex={template.Index}\tValid={template.Valid}\tDuress={template.Duress}\tType={template.Type}\tMajorVer={template.MajorVer}\tMinorVer={template.MinorVer}\tFormat={template.Format}\tTmp={template.Template}";

                        commands.Add(new ServerCommand
                        {
                            DeviceSerialNumber = device.SerialNumber,
                            CommandText = commandText
                        });
                    }
                }
            }

            // Add all commands to database
            if (commands.Any())
            {
                context.ServerCommands.AddRange(commands);
            }
        }

        // GET /iclock/ping?SN=...
        [HttpGet("ping")]
        public IActionResult Ping([FromQuery] string SN)
        {
            // This is just a heartbeat. We could update the device's LastSeen timestamp here if needed.
            return Content("OK", "text/plain");
        }
    }
}