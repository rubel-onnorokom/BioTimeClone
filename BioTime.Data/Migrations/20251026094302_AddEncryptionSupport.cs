using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BioTime.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEncryptionSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsEncryptionEnabled",
                table: "Devices",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PublicKey",
                table: "Devices",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SessionKey",
                table: "Devices",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsEncryptionEnabled",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "PublicKey",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "SessionKey",
                table: "Devices");
        }
    }
}
