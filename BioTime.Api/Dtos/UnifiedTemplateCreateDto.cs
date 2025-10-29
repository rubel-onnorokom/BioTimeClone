namespace BioTime.Api.Dtos
{
    public class UnifiedTemplateCreateDto
    {
        public int No { get; set; }
        public int Index { get; set; }
        public int Valid { get; set; }
        public int Duress { get; set; }
        public int Type { get; set; }
        public int MajorVer { get; set; }
        public int MinorVer { get; set; }
        public int Format { get; set; }
        public string Template { get; set; }
    }
}