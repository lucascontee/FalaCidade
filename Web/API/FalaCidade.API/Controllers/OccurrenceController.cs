using FalaCidade.API.Enums;
using FalaCidade.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace FalaCidade.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OccurrenceController : ControllerBase
{
    private readonly OccurrenceService _occurrenceService;

    public OccurrenceController(OccurrenceService occurrenceService)
    {
        _occurrenceService = occurrenceService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOccurrenceRequest request)
    {
        var occurrence = await _occurrenceService.CreateAsync(
            request.CitizenId,
            request.CategoryId,
            request.Title,
            request.Description,
            request.PhotoUrl,
            request.Latitude,
            request.Longitude
        );

        return CreatedAtAction(nameof(GetById), new { id = occurrence.Id }, occurrence);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var occurrences = await _occurrenceService.GetAllAsync();
        return Ok(occurrences);
    }

    [HttpGet("getAllForFeed")]
    public async Task<IActionResult> GetAllForFeed()
    {
        var occurences = await _occurrenceService.GetAllForFeedAsync();
        return Ok(occurences);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var occurrence = await _occurrenceService.GetByIdAsync(id);

        if (occurrence == null)
        {
            return NotFound(new { error = "Ocorrência não encontrada." });
        }

        return Ok(occurrence);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        var occurrence = await _occurrenceService.UpdateStatusAsync(
            id,
            request.ResponsibleUserId,
            request.NewStatus,
            request.Notes
        );

        if (occurrence == null)
        {
            return NotFound(new { error = "Ocorrência não encontrada." });
        }

        return Ok(occurrence);
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetHistory(int id)
    {
        var history = await _occurrenceService.GetHistoryAsync(id);
        return Ok(history);
    }

    [HttpGet("user/{citizenId}")]
    public async Task<IActionResult> GetByUser(int citizenId)
    {
        var occurrences = await _occurrenceService.GetByCitizenIdAsync(citizenId);
        return Ok(occurrences);
    }
}
public record CreateOccurrenceRequest(int CitizenId, int CategoryId, string Title, string Description, string PhotoUrl, double Latitude, double Longitude);
public record UpdateStatusRequest(int ResponsibleUserId, OccurrenceStatus NewStatus, string Notes);
