using System.Collections.Generic;

namespace BioTime.Data.Models
{
    public class User
    {
        public int Id { get; set; } // Database primary key

        // From ZKTeco Protocol
        public string? Pin { get; set; } // User ID on the device, should be unique
        public string? Name { get; set; }
        public string? Password { get; set; }
        public int Privilege { get; set; } = 0;
        public string? CardNumber { get; set; }

        // For the many-to-many relationship with Area, as per your requirement
        public List<UserArea> UserAreas { get; set; } = new();
        public List<FingerprintTemplate> FingerprintTemplates { get; set; } = new();
    }
}
