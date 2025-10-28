namespace BioTime.Api.Dtos
{
    public class FingerprintEnrollDto
    {
        public string? Pin { get; set; } // The PIN of the user to enroll
        public int FingerIndex { get; set; } // Which finger to enroll (0-9)
        public string? DeviceSerialNumber { get; set; } // The device to send the command to
        public int RetryCount { get; set; } = 3;
        public bool Overwrite { get; set; } = false;
        public string? TemplateData { get; set; } // New property to hold the fingerprint template data
    }
}
