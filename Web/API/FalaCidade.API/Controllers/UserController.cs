using FalaCidade.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace FalaCidade.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : Controller
{
    private readonly UserService _userService;

    public UserController(UserService userService)
    {
        _userService = userService;
    }

    [HttpPost("register/citizen")]
    public async Task<IActionResult> RegisterCitizen([FromBody] RegisterUserRequest request)
    {
        try
        {
            var user = await _userService.CreateCitizenAsync(request.Name, request.Email, request.Password, request.Cpf);

            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    [HttpPost("register/reviwer")]
    public async Task<IActionResult> CreateReviewer([FromBody] RegisterUserRequest request)
    {
        try
        {
            var user = await _userService.CreateReviewerAsync(request.Name, request.Email, request.Password, request.Cpf);

            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("register/admin")]
    public async Task<IActionResult> CreateAdmin([FromBody] RegisterUserRequest request)
    {
        try
        {
            var user = await _userService.CreateAdminAsync(request.Name, request.Email, request.Password, request.Cpf);

            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userService.AuthenticateAsync(request.Email, request.Password);

        if (user == null)
        {
            return Unauthorized(new { error = "E-mail ou senha inválidos." });
        }

        return Ok(user);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);

        if (user == null)
        {
            return NotFound(new { error = "Usuário não encontrado." });
        }

        return Ok(user);
    }

    [HttpPatch("{id}/role")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleDto UpdateRole)
    {
        try
         {
            await _userService.UpdateRole(id, UpdateRole.Role);
            return Ok(new { message = "Papel do usuário atualizado com sucesso!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }


    }

}
public record RegisterUserRequest(string Name, string Email, string Password, string Cpf);
public record LoginRequest(string Email, string Password);

public class UpdateRoleDto
{
    public int Role { get; set; }
}