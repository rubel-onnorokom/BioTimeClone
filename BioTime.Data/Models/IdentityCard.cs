using System;

namespace BioTime.Data.Models
{
    public class IdentityCard
    {
        public int Id { get; set; }
        public string? Pin { get; set; }
        public string? SNNum { get; set; }
        public string? IDNum { get; set; }
        public string? DNNum { get; set; }
        public string? Name { get; set; }
        public int Gender { get; set; }
        public int Nation { get; set; }
        public DateTime Birthday { get; set; }
        public string? ValidInfo { get; set; }
        public string? Address { get; set; }
        public string? AdditionalInfo { get; set; }
        public string? Issuer { get; set; }
        public string? Photo { get; set; }
        public string? FPTemplate1 { get; set; }
        public string? FPTemplate2 { get; set; }
        public string? Reserve { get; set; }
        public string? Notice { get; set; }
        public int DeviceId { get; set; }
        public Device? Device { get; set; }
    }
}
