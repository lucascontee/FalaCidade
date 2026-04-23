using FalaCidade.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace FalaCidade.API.Controllers;

[ApiController]
[Route("api/[controller]")] 
public class CategoryController : ControllerBase
{
    private readonly CategoryService _categoryService;

    public CategoryController(CategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _categoryService.GetAllAsync();
        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await _categoryService.GetByIdAsync(id);

        if (category == null)
        {
            return NotFound(new { error = "Categoria não encontrada." });
        }

        return Ok(category);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CategoryRequest request)
    {
        var category = await _categoryService.CreateAsync(request.Name, request.Description);

        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CategoryRequest request)
    {
        var category = await _categoryService.UpdateAsync(id, request.Name, request.Description);

        if (category == null)
        {
            return NotFound(new { error = "Categoria não encontrada." });
        }

        return Ok(category);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var success = await _categoryService.DeleteAsync(id);

            if (!success)
            {
                return NotFound(new { error = "Categoria não encontrada." });
            }

            return NoContent(); 
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public record CategoryRequest(string Name, string Description);