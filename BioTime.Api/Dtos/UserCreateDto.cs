using System.Collections.Generic;

namespace BioTime.Api.Dtos
{
    public class UserCreateDto
    {
        public string? Pin { get; set; }
        public string? Name { get; set; }
        public string? Password { get; set; }
        public int Privilege { get; set; } = 0;
        public string? CardNumber { get; set; }
        public List<int> AreaIds { get; set; } = new();
    }
}
