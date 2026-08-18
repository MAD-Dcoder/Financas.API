using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Financas.API.Data;
using Financas.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Financas.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartoesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Cartoes/usuario/2
        // Busca todos os cartões vinculados a um usuário específico
        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<Cartao>>> GetCartoesPorUsuario(int usuarioId)
        {
            var cartoes = await _context.Cartoes
                .Where(c => c.UsuarioId == usuarioId)
                .OrderBy(c => c.Id)
                .ToListAsync();

            if (cartoes == null || !cartoes.Any())
            {
                return Ok(new List<Cartao>()); // Retorna lista vazia se o usuário não tiver cartões
            }

            return Ok(cartoes);
        }

        // GET: api/Cartoes/5
        // Busca um cartão específico pelo ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Cartao>> GetCartao(int id)
        {
            var cartao = await _context.Cartoes.FindAsync(id);

            if (cartao == null)
            {
                return NotFound(new { mensagem = "Cartão não encontrado." });
            }

            return Ok(cartao);
        }

        // POST: api/Cartoes
        // Cria um novo cartão (ou atualiza se o ID já vier preenchido para evitar duplicatas)
        [HttpPost]
        public async Task<ActionResult<Cartao>> PostCartao(Cartao cartao)
        {
            // Se o objeto já possuir ID, redireciona internamente para atualizar para evitar duplicação
            if (cartao.Id > 0)
            {
                var cartaoExistente = await _context.Cartoes.FindAsync(cartao.Id);
                if (cartaoExistente != null)
                {
                    cartaoExistente.Nome = cartao.Nome;
                    cartaoExistente.UltimosDigitos = cartao.UltimosDigitos;
                    cartaoExistente.Bandeira = cartao.Bandeira;
                    cartaoExistente.LimiteTotal = cartao.LimiteTotal;
                    cartaoExistente.DiaVencimento = cartao.DiaVencimento;
                    cartaoExistente.DiaFechamento = cartao.DiaFechamento;
                    cartaoExistente.CorFundo = cartao.CorFundo;
                    cartaoExistente.CorTexto = cartao.CorTexto;
                    cartaoExistente.AtualizadoEm = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                    return Ok(cartaoExistente);
                }
            }

            // Garante que a data de criação seja o momento exato do cadastro
            cartao.CriadoEm = DateTime.UtcNow;
            cartao.AtualizadoEm = DateTime.UtcNow;

            _context.Cartoes.Add(cartao);
            await _context.SaveChangesAsync();

            // Retorna status 201 Created com os dados do cartão inserido
            return CreatedAtAction(nameof(GetCartao), new { id = cartao.Id }, cartao);
        }

        // PUT: api/Cartoes/5
        // Atualiza limite, nome, cores ou datas de um cartão existente
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCartao(int id, Cartao cartaoAtualizado)
        {
            // Se o ID do corpo estiver vazio mas a rota tem ID, assume o ID da rota
            if (cartaoAtualizado.Id == 0)
            {
                cartaoAtualizado.Id = id;
            }

            if (id != cartaoAtualizado.Id)
            {
                return BadRequest(new { mensagem = "ID da rota difere do ID do cartão." });
            }

            var cartaoExistente = await _context.Cartoes.FindAsync(id);
            if (cartaoExistente == null)
            {
                return NotFound(new { mensagem = "Cartão não encontrado." });
            }

            // Atualiza apenas os campos permitidos
            cartaoExistente.Nome = cartaoAtualizado.Nome;
            cartaoExistente.UltimosDigitos = cartaoAtualizado.UltimosDigitos;
            cartaoExistente.Bandeira = cartaoAtualizado.Bandeira;
            cartaoExistente.LimiteTotal = cartaoAtualizado.LimiteTotal;
            cartaoExistente.DiaVencimento = cartaoAtualizado.DiaVencimento;
            cartaoExistente.DiaFechamento = cartaoAtualizado.DiaFechamento;
            cartaoExistente.CorFundo = cartaoAtualizado.CorFundo;
            cartaoExistente.CorTexto = cartaoAtualizado.CorTexto;
            cartaoExistente.AtualizadoEm = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CartaoExists(id))
                {
                    return NotFound(new { mensagem = "Cartão foi deletado enquanto você tentava atualizar." });
                }
                else
                {
                    throw;
                }
            }

            return NoContent(); // 204 No Content (Atualizou com sucesso)
        }

        // DELETE: api/Cartoes/5
        // Exclui um cartão permanentemente
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCartao(int id)
        {
            var cartao = await _context.Cartoes.FindAsync(id);
            if (cartao == null)
            {
                return NotFound(new { mensagem = "Cartão não encontrado." });
            }

            _context.Cartoes.Remove(cartao);
            await _context.SaveChangesAsync();

            return NoContent(); // 204 No Content (Deletou com sucesso)
        }

        private bool CartaoExists(int id)
        {
            return _context.Cartoes.Any(e => e.Id == id);
        }
    }
}