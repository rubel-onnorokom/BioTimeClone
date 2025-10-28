using System;

namespace BioTime.Data.Models
{
    public class ServerCommand
    {
        public int Id { get; set; }

        // The serial number of the device this command is for
        public string? DeviceSerialNumber { get; set; }

        // The actual command string to be sent to the device
        // e.g., "C:123:DATA UPDATE USERINFO PIN=123..."
        public string? CommandText { get; set; }

        // Status tracking
        public bool IsSent { get; set; } = false;
        public DateTime? SentOn { get; set; }
        public bool IsAcknowledged { get; set; } = false;
        public DateTime? AcknowledgedOn { get; set; }
        public string? AckResponse { get; set; } // The reply from the device, e.g., "ID=123&Return=0&CMD=DATA"
    }
}
