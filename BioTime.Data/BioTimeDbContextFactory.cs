using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BioTime.Data
{
    public class BioTimeDbContextFactory : IDesignTimeDbContextFactory<BioTimeDbContext>
    {
        public BioTimeDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<BioTimeDbContext>();
            optionsBuilder.UseSqlite("Data Source=biotime.db");

            return new BioTimeDbContext(optionsBuilder.Options);
        }
    }
}
