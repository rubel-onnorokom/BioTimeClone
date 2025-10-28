using System.Collections.Generic;

namespace BioTime.Data.Models
{
    public class Area
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public List<Device> Devices { get; set; } = new();
        public List<UserArea> UserAreas { get; set; } = new();
    }
}
