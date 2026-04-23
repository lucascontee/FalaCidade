using FalaCidade.API.Data;
using FalaCidade.API.Entities;
using FalaCidade.API.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace FalaCidade.API.Services;

public class UserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }


    public async Task<User?> AuthenticateAsync(string email, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            return null; 
        }

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.Password);

        if (!isPasswordValid)
        {
            return null; 
        }

        return user;
    }

    public async Task<User> CreateCitizenAsync(string name, string email, string rawPassword, string cpf)
    {

        if (!IsEmailValid(email))
        {
            throw new Exception("O e-mail informado tem um formato inválido.");
        }

        if (!IsCpfValid(cpf))
        {
            throw new Exception("O CPF informado é inválido.");
        }

        var cleanCpf = new string(cpf.Where(char.IsDigit).ToArray());

        if (await _context.Users.AnyAsync(u => u.Email == email))
        {
            throw new Exception("Este e-mail já está em uso.");
        }

        if (await _context.Users.AnyAsync(u => u.Cpf == cleanCpf))
        {
            throw new Exception("Este CPF já está em uso.");
        }

        var newCitizen = new User
        {
            Name = name,
            Email = email,
            Password = BCrypt.Net.BCrypt.HashPassword(rawPassword),
            Cpf = cleanCpf,
            Role = UserRole.Citizen,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(newCitizen);
        await _context.SaveChangesAsync();

        return newCitizen;
    }

    public async Task<User> CreateReviewerAsync(string name, string email, string rawPassword, string cpf)
    {
        if (!IsEmailValid(email))
        {
            throw new Exception("O e-mail informado tem um formato inválido.");
        }

        if (!IsCpfValid(cpf))
        {
            throw new Exception("O CPF informado é inválido.");
        }

        var cleanCpf = new string(cpf.Where(char.IsDigit).ToArray());

        if (await _context.Users.AnyAsync(u => u.Email == email))
        {
            throw new Exception("Este e-mail já está em uso.");
        }

        if (await _context.Users.AnyAsync(u => u.Cpf == cleanCpf))
        {
            throw new Exception("Este CPF já está em uso.");
        }

        var newReviewer = new User
        {
            Name = name,
            Email = email,
            Password = BCrypt.Net.BCrypt.HashPassword(rawPassword),
            Cpf = cleanCpf,
            Role = UserRole.Reviewer,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(newReviewer);
        await _context.SaveChangesAsync();

        return newReviewer;
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
    }

    public static bool IsCpfValid(string cpf)
    {
        if (string.IsNullOrWhiteSpace(cpf))
            return false;

        cpf = new string(cpf.Where(char.IsDigit).ToArray());

        if (cpf.Length != 11)
            return false;

        if (cpf.Distinct().Count() == 1)
            return false;

        int[] multiplicador1 = { 10, 9, 8, 7, 6, 5, 4, 3, 2 };
        int soma = 0;
        for (int i = 0; i < 9; i++)
            soma += int.Parse(cpf[i].ToString()) * multiplicador1[i];

        int resto = soma % 11;
        int digito1 = resto < 2 ? 0 : 11 - resto;

        if (int.Parse(cpf[9].ToString()) != digito1)
            return false;

        int[] multiplicador2 = { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 };
        soma = 0;
        for (int i = 0; i < 10; i++)
            soma += int.Parse(cpf[i].ToString()) * multiplicador2[i];

        resto = soma % 11;
        int digito2 = resto < 2 ? 0 : 11 - resto;

        return int.Parse(cpf[10].ToString()) == digito2;
    }

    public static bool IsEmailValid(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        var regex = new Regex(@"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$", RegexOptions.IgnoreCase);

        return regex.IsMatch(email);
    }
}
