using Azure;
using FalaCidade.API.Data;
using FalaCidade.API.DTO;
using FalaCidade.API.Entities;
using FalaCidade.API.Enums;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace FalaCidade.API.Services;

public class OccurrenceService
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notificationService; 
    private readonly HttpClient _httpClient;

    public OccurrenceService(AppDbContext context, NotificationService notificationService, HttpClient httpClient)
    {
        _context = context;
        _notificationService = notificationService;
        _httpClient = httpClient;
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

        AddressDTO address = await GetAddressFromCoordsAsync(latitude, longitude);
        if(address != null)
        {
            occurrence.City = address.Address.City;
            occurrence.Neighborhood = address.Address.Neighbourhood;
            occurrence.Street = address.Address.Road;
        }

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

    internal async Task<IEnumerable<Occurrence>> GetAllForFeedAsync()
    {
        return await _context.Occurrences
            .Include(o => o.Category)
            .Include(o => o.Citizen)
            .Where(o => o.Status != OccurrenceStatus.Rejected && o.Status != OccurrenceStatus.UnderReview)
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

    public async Task<IEnumerable<Occurrence>> GetByCitizenIdAsync(int citizenId)
    {
        return await _context.Occurrences
            .Include(o => o.Category)
            .Where(o => o.CitizenId == citizenId)
            .OrderByDescending(o => o.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task AddHistoryAsync(int occurrenceId, int userId, OccurrenceStatus newStatus, string message)
    {
        var occurrence = await _context.Occurrences.FirstOrDefaultAsync(o => o.Id == occurrenceId);

        if (occurrence == null)
        {
            throw new Exception("Ocorrência não encontrada.");
        }

        var previousStatus = occurrence.Status;

        occurrence.Status = newStatus;

        var historyRecord = new OccurrenceHistory
        {
            OccurrenceId = occurrenceId,
            ResponsibleUserId = userId,
            PreviousStatus = previousStatus,
            NewStatus = newStatus,
            Notes = message,
            CreatedAt = DateTime.UtcNow 
        };

        await _context.OccurrenceHistories.AddAsync(historyRecord);
        await _context.SaveChangesAsync();
    }

    public async Task<AddressDTO> GetAddressFromCoordsAsync(double lat, double lng)
    {
        AddressDTO address = new AddressDTO();
        var latStr = lat.ToString(CultureInfo.InvariantCulture);
        var lngStr = lng.ToString(CultureInfo.InvariantCulture);

        var url = $"https://nominatim.openstreetmap.org/reverse?format=json&lat={latStr}&lon={lngStr}&zoom=18&addressdetails=1";
        try
        {
            var data = await _httpClient.GetFromJsonAsync<AddressDTO>(url);

            if (data?.Address != null)
            {
                var street = data.Address.Road ?? "Rua desconhecida";
                var neighborhood = data.Address.Suburb ?? data.Address.Neighbourhood ?? "";
                var formattedNeighborhood = !string.IsNullOrEmpty(neighborhood) ? $"{neighborhood}" : "";
                var city = data.Address.City ?? data.Address.Town ?? data.Address.Village ?? "";

                address.Address = new NominatimAddress(); 
                address.Address.City = city;
                address.Address.Neighbourhood = formattedNeighborhood;
                address.Address.Road = street;

                return address;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro do ViaCEP/Nominatim: {ex.Message}");
        }

        return null;
    }
}
