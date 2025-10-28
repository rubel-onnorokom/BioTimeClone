using System;

namespace BioTime.Data.Models
{
    public class IdentityCardAttendanceLog
    {
        public long Id { get; set; }
        public string? Pin { get; set; }
        public DateTime Timestamp { get; set; }
        public int Status { get; set; }
        public int VerificationMode { get; set; }
        public string? WorkCode { get; set; }
        public string? Reserved1 { get; set; }
        public string? Reserved2 { get; set; }
        public string? IDNum { get; set; }
        public int Type { get; set; }
        public int DeviceId { get; set; }
        public Device? Device { get; set; }
    }
}
