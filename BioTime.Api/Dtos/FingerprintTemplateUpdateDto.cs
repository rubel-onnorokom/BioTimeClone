namespace BioTime.Api.Dtos
{
    public class FingerprintTemplateUpdateDto
    {
        public int FingerIndex { get; set; }
        public int Size { get; set; }
        public int Valid { get; set; }
        public string Template { get; set; }
    }
}