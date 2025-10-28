using System.Collections.Generic;

namespace BioTime.Api.Dtos
{
    public class UserAreaUpdateDto
    {
        public List<int> AreaIds { get; set; } = new();
    }
}
