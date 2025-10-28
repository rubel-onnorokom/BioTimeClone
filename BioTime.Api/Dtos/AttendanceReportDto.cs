namespace BioTime.Api.Dtos
{
    public class AttendanceReportDto
    {
        public DateTime Date { get; set; }
        public string? InTime { get; set; }
        public string? OutTime { get; set; }
        public bool IsLateEntry { get; set; }
        public bool IsEarlyLeave { get; set; }
        public string? WorkingHours { get; set; }
        public string? AbsentLeaveReason { get; set; } // e.g., "Holiday", "Weekend", "Absent"
        public string? Zone { get; set; } // From Device's Area
    }
}