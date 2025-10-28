using System;

namespace BioTime.Data.Models
{
    public class ErrorLog
    {
        public int Id { get; set; }
        public string? ErrCode { get; set; }
        public string? ErrMsg { get; set; }
        public string? DataOrigin { get; set; }
        public string? CmdId { get; set; }
        public string? Additional { get; set; }
        public int DeviceId { get; set; }
        public Device? Device { get; set; }
    }
}
