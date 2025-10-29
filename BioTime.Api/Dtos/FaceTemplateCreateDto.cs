namespace BioTime.Api.Dtos
{
    public class FaceTemplateCreateDto
    {
        public int FID { get; set; }
        public int Size { get; set; }
        public int Valid { get; set; }
        public string Template { get; set; }
    }
}