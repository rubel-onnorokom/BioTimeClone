using System;

namespace BioTime.Data.Models
{
    public class Device
    {
        public int Id { get; set; }
        public string? SerialNumber { get; set; } // This will be the primary identifier from the device
        public string? Name { get; set; } // Added Name property
        public string? IPAddress { get; set; }
        public string? FirmwareVersion { get; set; }
        public DateTime LastSeen { get; set; }

        // Foreign key for Area, as per your requirement
        public int? AreaId { get; set; }
        public Area? Area { get; set; }

        // Device configuration properties
        public int ErrorDelay { get; set; } = 30;
        public int Delay { get; set; } = 10;
        public string TransTimes { get; set; } = "00:00;14:00";
        public int TransInterval { get; set; } = 1;
        public string TransFlag { get; set; } = "1111000000";
        public int Realtime { get; set; } = 1;
        public int TimeZone { get; set; } = 6;

        // Device metrics
        public int UserCount { get; set; }
        public int AdminCount { get; set; }
        public int FingerprintCount { get; set; }
        public int FaceCount { get; set; }

        // New device metrics
        public int AttendanceRecordCount { get; set; }
        public string? FingerprintAlgorithmVersion { get; set; }
        public string? FaceAlgorithmVersion { get; set; }
        public int RequiredFaceCount { get; set; }
        public string? SupportedFunctions { get; set; }

        // New device properties
        public string? Language { get; set; }
        public string? PushVersion { get; set; }
        public string? PushOptionsFlag { get; set; }

        // Encryption properties
        public string? PublicKey { get; set; }
        public string? SessionKey { get; set; }
        public bool IsEncryptionEnabled { get; set; }
    }
}
