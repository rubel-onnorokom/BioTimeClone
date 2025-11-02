using System.Collections.Generic;

namespace BioTime.Api.Dtos
{
    public class UserUpdateDto
    {
        public string Name { get; set; }
        public string Password { get; set; }
        public int Privilege { get; set; }
        public string CardNumber { get; set; }
        public List<int> AreaIds { get; set; }
    }
}
