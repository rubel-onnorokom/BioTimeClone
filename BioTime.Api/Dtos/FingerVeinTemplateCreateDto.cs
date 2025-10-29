namespace BioTime.Api.Dtos
{
    public class FingerVeinTemplateCreateDto
    {
        public int FID { get; set; }
        public int Index { get; set; }
        public int Size { get; set; }
        public int Valid { get; set; }
        public string Template { get; set; }
    }
}