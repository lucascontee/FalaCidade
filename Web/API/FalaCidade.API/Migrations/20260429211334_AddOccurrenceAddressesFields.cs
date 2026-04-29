using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FalaCidade.API.Migrations
{
    /// <inheritdoc />
    public partial class AddOccurrenceAddressesFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Occurrences",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Neighborhood",
                table: "Occurrences",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Street",
                table: "Occurrences",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "Occurrences");

            migrationBuilder.DropColumn(
                name: "Neighborhood",
                table: "Occurrences");

            migrationBuilder.DropColumn(
                name: "Street",
                table: "Occurrences");
        }
    }
}
