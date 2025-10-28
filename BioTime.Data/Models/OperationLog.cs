using System;

namespace BioTime.Data.Models
{
    public class OperationLog
    {
        public long Id { get; set; }

        // Foreign key to the device that sent this log
        public int DeviceId { get; set; }
        public Device? Device { get; set; }

        public int OperationType { get; set; } // OpType from protocol
        public string? Operator { get; set; } // OpWho from protocol
        public DateTime Timestamp { get; set; } // OpTime from protocol

        // Operands - storing as strings for maximum flexibility
        public string? Operand1 { get; set; }
        public string? Operand2 { get; set; }
        public string? Operand3 { get; set; }
        public string? Reserved { get; set; }
    }
}
