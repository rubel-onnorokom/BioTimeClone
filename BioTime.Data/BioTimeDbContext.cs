using BioTime.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace BioTime.Data
{
    public class BioTimeDbContext : DbContext
    {
        public BioTimeDbContext(DbContextOptions<BioTimeDbContext> options) : base(options) { }

        public DbSet<Area> Areas { get; set; }
        public DbSet<Device> Devices { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserArea> UserAreas { get; set; }
        public DbSet<AttendanceLog> AttendanceLogs { get; set; }
        public DbSet<ServerCommand> ServerCommands { get; set; }
        public DbSet<FingerprintTemplate> FingerprintTemplates { get; set; }
        public DbSet<OperationLog> OperationLogs { get; set; }
        public DbSet<AttendancePhoto> AttendancePhotos { get; set; }
        public DbSet<UserInfo> UserInfos { get; set; }
        public DbSet<IdentityCard> IdentityCards { get; set; }
        public DbSet<IdentityCardAttendanceLog> IdentityCardAttendanceLogs { get; set; }
        public DbSet<IdentityCardAttendancePhoto> IdentityCardAttendancePhotos { get; set; }
        public DbSet<FaceTemplate> FaceTemplates { get; set; }
        public DbSet<FingerVeinTemplate> FingerVeinTemplates { get; set; }
        public DbSet<UnifiedTemplate> UnifiedTemplates { get; set; }
        public DbSet<UserPhoto> UserPhotos { get; set; }
        public DbSet<ComparisonPhoto> ComparisonPhotos { get; set; }
        public DbSet<ErrorLog> ErrorLogs { get; set; }
        public DbSet<DataPacket> DataPackets { get; set; }
        public DbSet<DeviceOption> DeviceOptions { get; set; }
        public DbSet<AdministrativeUser> AdministrativeUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure the composite key for the UserArea join table
            modelBuilder.Entity<UserArea>()
                .HasKey(ua => new { ua.UserId, ua.AreaId });

            // Configure the many-to-many relationship between User and Area
            modelBuilder.Entity<UserArea>()
                .HasOne(ua => ua.User)
                .WithMany(u => u.UserAreas)
                .HasForeignKey(ua => ua.UserId);

            modelBuilder.Entity<UserArea>()
                .HasOne(ua => ua.Area)
                .WithMany(a => a.UserAreas)
                .HasForeignKey(ua => ua.AreaId);

            // Add unique constraints for natural keys from the devices
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Pin)
                .IsUnique();

            modelBuilder.Entity<Device>()
                .HasIndex(d => d.SerialNumber)
                .IsUnique();
        }
    }
}
