using Financas.API.Data;
using Financas.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Financas.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsuariosController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Usuarios
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
    {
        var usuarios = await _context.Usuarios.ToListAsync();
        return Ok(usuarios);
    }

    // POST: api/Usuarios
    [HttpPost]
    public async Task<ActionResult<Usuario>> PostUsuario(Usuario usuario)
    {
        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUsuarios), new { id = usuario.Id }, usuario);
    }
    // POST: api/Usuarios/login
    [HttpPost("login")]
    public async Task<ActionResult<Usuario>> Login([FromBody] Usuario loginInfo)
    {
        // Agora ele busca usando SenhaHash
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == loginInfo.Email && u.SenhaHash == loginInfo.SenhaHash);

        if (usuario == null)
        {
            return Unauthorized(new { message = "E-mail ou senha inválidos." });
        }

        return Ok(usuario);
    }
}