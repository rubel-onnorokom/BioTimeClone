using System;

namespace BioTime.Data.Models
{
    public class AttendanceLog
    {
        public long Id { get; set; }
        public string? Pin { get; set; } // User PIN from the device
        public DateTime Timestamp { get; set; }
        public int Status { get; set; }
        public int VerificationMode { get; set; }
        public string? WorkCode { get; set; }
        public string? Reserved1 { get; set; }
        public string? Reserved2 { get; set; }

        // Foreign key to the device that sent this log
        public int DeviceId { get; set; }
        public Device? Device { get; set; }
    }
}
