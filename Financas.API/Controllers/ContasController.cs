using Financas.API.Data;
using Financas.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Financas.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContasController : ControllerBase
{
    private readonly AppDbContext _context;

    public ContasController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Contas/usuario/1
    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<IEnumerable<Conta>>> GetContasPorUsuario(int usuarioId)
    {
        var contas = await _context.Contas
            .Where(c => c.UsuarioId == usuarioId)
            .ToListAsync();

        return Ok(contas);
    }

    // POST: api/Contas
    [HttpPost]
    public async Task<ActionResult<Conta>> PostConta(Conta conta)
    {
        _context.Contas.Add(conta);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetContasPorUsuario), new { usuarioId = conta.UsuarioId }, conta);
    }
}