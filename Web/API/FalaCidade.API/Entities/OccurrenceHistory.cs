using FalaCidade.API.Enums;

namespace FalaCidade.API.Entities;

public class OccurrenceHistory
{
        public int Id { get; set; }
        public string Notes { get; set; } = string.Empty;
        public OccurrenceStatus PreviousStatus { get; set; }
        public OccurrenceStatus NewStatus { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int OccurrenceId { get; set; }
        public Occurrence Occurrence { get; set; } = null!;

        //Usuário responsável pela mudança (Admin ou Aceitador)
        public int ResponsibleUserId { get; set; }
        public User ResponsibleUser { get; set; } = null!;
}
