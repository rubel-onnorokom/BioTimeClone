using System;

namespace BioTime.Data.Models
{
    public class DataPacket
    {
        public int Id { get; set; }
        public string? ContentType { get; set; }
        public byte[]? Data { get; set; }
        public int DeviceId { get; set; }
        public Device? Device { get; set; }
    }
}
