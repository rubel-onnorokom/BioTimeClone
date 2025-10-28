namespace BioTime.Data.Models
{
    // Join table for the many-to-many relationship between User and Area
    public class UserArea
    {
        public int UserId { get; set; }
        public User? User { get; set; }

        public int AreaId { get; set; }
        public Area? Area { get; set; }
    }
}
