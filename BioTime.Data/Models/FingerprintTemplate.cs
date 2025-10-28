namespace BioTime.Data.Models
{
    public class FingerprintTemplate
    {
        public int Id { get; set; }

        // Foreign key to the User
        public int UserId { get; set; }
        public User? User { get; set; }

        public int FingerIndex { get; set; } // FID from the protocol
        public string? Template { get; set; } // The Base64 encoded template string
        public int Size { get; set; }
        public int Valid { get; set; }
    }
}
