using System;

namespace BioTime.Data.Models
{
    public class FaceTemplate
    {
        public int Id { get; set; }
        public string? Pin { get; set; }
        public int FID { get; set; }
        public int Size { get; set; }
        public int Valid { get; set; }
        public string? Template { get; set; }
        public int DeviceId { get; set; }
        public Device? Device { get; set; }
    }
}
