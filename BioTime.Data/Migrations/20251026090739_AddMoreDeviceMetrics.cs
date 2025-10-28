using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BioTime.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMoreDeviceMetrics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AttendanceRecordCount",
                table: "Devices",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "FaceAlgorithmVersion",
                table: "Devices",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FingerprintAlgorithmVersion",
                table: "Devices",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RequiredFaceCount",
                table: "Devices",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SupportedFunctions",
                table: "Devices",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AttendanceRecordCount",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "FaceAlgorithmVersion",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "FingerprintAlgorithmVersion",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "RequiredFaceCount",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "SupportedFunctions",
                table: "Devices");
        }
    }
}
