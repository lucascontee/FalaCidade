using FalaCidade.API.Enums;

namespace FalaCidade.API.Entities;

public class User
{
    public int Id { get; set; }
    public string Cpf { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password{ get; set; } = string.Empty;

    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Propriedades de Navegação
    public ICollection<Occurrence> Occurrences { get; set; } = new List<Occurrence>();
    //public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
