using FalaCidade.API.Data;
using FalaCidade.API.Entities;
using FalaCidade.API.Enums;
using Microsoft.EntityFrameworkCore;

namespace FalaCidade.API.Services;

public class OccurrenceService
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notificationService; 

    public OccurrenceService(AppDbContext context, NotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<Occurrence> CreateAsync(int citizenId, int categoryId, string title, string description, string photoUrl, double latitude, double longitude)
    {
        var occurrence = new Occurrence
        {
            CitizenId = citizenId,
            CategoryId = categoryId,
            Title = title,
            Description = description,
            PhotoUrl = photoUrl,
            Latitude = latitude,
            Longitude = longitude,
            Status = OccurrenceStatus.UnderReview, 
            CreatedAt = DateTime.UtcNow
        };

        _context.Occurrences.Add(occurrence);
        await _context.SaveChangesAsync();

        return occurrence;
    }


    public async Task<IEnumerable<Occurrence>> GetAllAsync()
    {
        return await _context.Occurrences
            .Include(o => o.Category) 
            .Include(o => o.Citizen) 
            .OrderByDescending(o => o.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }


    public async Task<Occurrence?> GetByIdAsync(int id)
    {
        return await _context.Occurrences
            .Include(o => o.Category)
            .Include(o => o.Citizen)
            .Include(o => o.History) 
                .ThenInclude(h => h.ResponsibleUser)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Occurrence?> UpdateStatusAsync(int occurrenceId, int responsibleUserId, OccurrenceStatus newStatus, string notes)
    {
        var occurrence = await _context.Occurrences.FindAsync(occurrenceId);

        if (occurrence == null)
        {
            return null;
        }

        if (occurrence.Status == newStatus)
        {
            return occurrence;
        }
        var history = new OccurrenceHistory
        {
            OccurrenceId = occurrenceId,
            ResponsibleUserId = responsibleUserId,
            PreviousStatus = occurrence.Status,
            NewStatus = newStatus,
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };

        occurrence.Status = newStatus;
        occurrence.UpdatedAt = DateTime.UtcNow;

        _context.OccurrenceHistories.Add(history);
        await _context.SaveChangesAsync();

        string mensagem = $"A sua solicitação '{occurrence.Title}' foi atualizada para: {newStatus}.";
        await _notificationService.CreateAsync(occurrence.CitizenId, mensagem, occurrence.Id);

        return occurrence;
    }

    public async Task<IEnumerable<OccurrenceHistory>> GetHistoryAsync(int occurrenceId)
    {
        return await _context.OccurrenceHistories
            .Include(h => h.ResponsibleUser)
            .Where(h => h.OccurrenceId == occurrenceId)
            .OrderByDescending(h => h.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }
}
