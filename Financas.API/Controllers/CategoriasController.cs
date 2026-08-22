using Financas.API.Data;
using Financas.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Financas.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoriasController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriasController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Categorias/usuario/1
    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<IEnumerable<Categoria>>> GetCategorias(int usuarioId)
    {
        // Busca apenas as categorias ATIVAS e as ordena pela coluna Ordem
        var categorias = await _context.Categorias
            .Where(c => c.UsuarioId == usuarioId && c.Ativo)
            .OrderBy(c => c.Ordem)
            .ToListAsync();

        return Ok(categorias);
    }

    // POST: api/Categorias
    [HttpPost]
    public async Task<ActionResult<Categoria>> PostCategoria(Categoria categoria)
    {
        // Garante os valores padrão na criação
        categoria.CriadoEm = DateTime.UtcNow;
        categoria.Ativo = true;

        // Se o front-end não mandar uma ordem, coloca a nova categoria no final da lista
        if (categoria.Ordem == 0)
        {
            var ultimaOrdem = await _context.Categorias
                .Where(c => c.UsuarioId == categoria.UsuarioId)
                .MaxAsync(c => (int?)c.Ordem) ?? 0;

            categoria.Ordem = ultimaOrdem + 1;
        }

        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategorias), new { usuarioId = categoria.UsuarioId }, categoria);
    }

    // PUT: api/Categorias/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutCategoria(int id, Categoria categoriaAtualizada)
    {
        if (id != categoriaAtualizada.Id)
        {
            return BadRequest("O ID da categoria não corresponde.");
        }

        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null)
        {
            return NotFound("Categoria não encontrada.");
        }

        // Atualiza apenas os campos editáveis
        categoria.Nome = categoriaAtualizada.Nome;
        categoria.Tipo = categoriaAtualizada.Tipo;
        categoria.CorHex = categoriaAtualizada.CorHex;
        categoria.Ordem = categoriaAtualizada.Ordem;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Categorias/5 (Exclusão Lógica)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategoria(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null)
        {
            return NotFound();
        }

        // Exclusão lógica: apenas oculta a categoria em vez de apagar do banco
        categoria.Ativo = false;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}