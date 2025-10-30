namespace BioTime.Api.Dtos
{
    public class FingerprintBatchRequest
    {
        public List<TemplateData> Templates { get; set; }
        public string FingerIndices { get; set; }
    }

    public class TemplateData
    {
        public int No { get; set; }
        public int? Length { get; set; }
        public string Template { get; set; }
        public string Version { get; set; } = "10";
    }
}
