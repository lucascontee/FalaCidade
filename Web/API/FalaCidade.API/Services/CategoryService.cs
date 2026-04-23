using FalaCidade.API.Data;
using FalaCidade.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace FalaCidade.API.Services;

public class CategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        return await _context.Categories
            .AsNoTracking() 
            .ToListAsync();
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        return await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Category> CreateAsync(string name, string description)
    {
        var category = new Category
        {
            Name = name,
            Description = description
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return category;
    }

    public async Task<Category?> UpdateAsync(int id, string name, string description)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category == null)
            return null;

        category.Name = name;
        category.Description = description;

        await _context.SaveChangesAsync();

        return category;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category == null)
            return false;

        var hasOccurrences = await _context.Occurrences.AnyAsync(o => o.CategoryId == id);
        if (hasOccurrences)
        {
            throw new Exception("Não é possível eliminar esta categoria pois já existem ocorrências associadas a ela.");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return true;
    }
}
