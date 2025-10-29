namespace BioTime.Api.Dtos
{
    public class FaceTemplateUpdateDto
    {
        public int FID { get; set; }
        public int Size { get; set; }
        public int Valid { get; set; }
        public string Template { get; set; }
    }
}