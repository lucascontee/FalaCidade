using FalaCidade.API.Enums;

namespace FalaCidade.API.Entities;

public class Occurrence
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public string PhotoUrl { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? City {  get; set; } = string.Empty;
    public string? Neighborhood {  get; set; } = string.Empty;
    public string? Street {  get; set; } = string.Empty;

    public OccurrenceStatus Status { get; set; } = OccurrenceStatus.UnderReview;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public int CitizenId { get; set; }
    public User Citizen { get; set; } = null!;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public ICollection<OccurrenceHistory> History { get; set; } = new List<OccurrenceHistory>();
}
