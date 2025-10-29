namespace BioTime.Api.Dtos
{
    public class FingerprintTemplateCreateDto
    {
        public int FingerIndex { get; set; }
        public int Size { get; set; }
        public int Valid { get; set; }
        public string Template { get; set; }
    }
}