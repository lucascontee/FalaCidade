namespace FalaCidade.API.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Propriedade de Navegação
    public ICollection<Occurrence> Occurrences { get; set; } = new List<Occurrence>();   
}
