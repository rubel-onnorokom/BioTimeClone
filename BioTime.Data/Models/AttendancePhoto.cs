using System;

namespace BioTime.Data.Models
{
    public class AttendancePhoto
    {
        public long Id { get; set; }
        public string? Pin { get; set; }
        public string? FileName { get; set; }
        public int PhotoType { get; set; }
        public int Size { get; set; }
        public string? PhotoData { get; set; }
        public int DeviceId { get; set; }
        public Device? Device { get; set; }
    }
}
