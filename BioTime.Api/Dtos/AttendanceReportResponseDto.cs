using System.Collections.Generic;
using System;

namespace BioTime.Api.Dtos
{
    public class AttendanceReportResponseDto
    {
        public List<AttendanceReportDto> DailyReports { get; set; } = new List<AttendanceReportDto>();
        public TimeSpan? TotalWorkingHours { get; set; }
        public int TotalLateEntries { get; set; }
        public int TotalEarlyLeaves { get; set; }
    }
}