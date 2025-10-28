using System;

namespace BioTime.Data.Models
{
    public class UserInfo
    {
        public int Id { get; set; }
        public string? Pin { get; set; }
        public string? Name { get; set; }
        public string? Password { get; set; }
        public int Privilege { get; set; }
        public string? CardNumber { get; set; }
        public string? Group { get; set; }
        public string? TimeZone { get; set; }
        public string? Verify { get; set; }
        public string? ViceCard { get; set; }
        public int DeviceId { get; set; }
        public Device? Device { get; set; }
    }
}
