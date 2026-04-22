using FalaCidade.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace FalaCidade.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<OccurrenceHistory> OccurrenceHistories { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Occurrence> Occurrences { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<Occurrence>()
            .Property(o => o.Status)
            .HasConversion<string>();

        modelBuilder.Entity<OccurrenceHistory>()
            .Property(h => h.PreviousStatus)
            .HasConversion<string>();

        modelBuilder.Entity<OccurrenceHistory>()
            .Property(h => h.NewStatus)
            .HasConversion<string>();

        modelBuilder.Entity<Occurrence>()
            .Property(o => o.Title)
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<Occurrence>()
            .Property(o => o.Description)
            .HasMaxLength(2048); 

        modelBuilder.Entity<Occurrence>()
            .HasOne(o => o.Citizen)
            .WithMany(u => u.Occurrences)
            .HasForeignKey(o => o.CitizenId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OccurrenceHistory>()
            .HasOne(h => h.ResponsibleUser)
            .WithMany() 
            .HasForeignKey(h => h.ResponsibleUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
