using Financas.API.Data;
using Financas.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization; // <=== IMPORTAÇÃO ADICIONADA AQUI

namespace Financas.API.Controllers
{
    [Authorize] // <=== O CADEADO ESTÁ AQUI! Ninguém acessa as transações sem Token.
    [ApiController]
    [Route("api/[controller]")]
    public class TransacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransacoesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<Transacao>>> GetTransacoesPorUsuario(int usuarioId)
        {
            var transacoes = await _context.Transacoes
                .Where(t => t.UsuarioId == usuarioId)
                .OrderByDescending(t => t.DataTransacao)
                .ToListAsync();

            return Ok(transacoes);
        }

        [HttpPost]
        public async Task<ActionResult<Transacao>> PostTransacao(Transacao transacao)
        {
            _context.Transacoes.Add(transacao);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransacoesPorUsuario), new { usuarioId = transacao.UsuarioId }, transacao);
        }

        [HttpGet("projecao/{usuarioId}")]
        public async Task<IActionResult> GetProjecaoSaldo(int usuarioId, [FromQuery] DateTime inicio, [FromQuery] DateTime fim)
        {
            // Garantir que os parâmetros usados na query sejam UTC (Npgsql exige DateTimeKind consistente para timestamptz)
            var inicioUtc = DateTime.SpecifyKind(inicio.Date, DateTimeKind.Utc);
            var dataFimAjustada = fim.Date.AddDays(1).AddTicks(-1);
            var fimUtc = DateTime.SpecifyKind(dataFimAjustada, DateTimeKind.Utc);

            var transacoes = await _context.Transacoes
                .Where(t => t.UsuarioId == usuarioId && t.DataTransacao >= inicioUtc && t.DataTransacao <= fimUtc)
                .ToListAsync();

            var totalReceitas = transacoes.Where(t => t.Tipo == TipoTransacao.receita).Sum(t => t.Valor);
            var totalDespesas = transacoes.Where(t => t.Tipo == TipoTransacao.despesa).Sum(t => t.Valor);
            var saldoProjetado = totalReceitas - totalDespesas;

            return Ok(new
            {
                UsuarioId = usuarioId,
                InicioPeriodo = inicio.ToString("yyyy-MM-dd"),
                FimPeriodo = fim.ToString("yyyy-MM-dd"),
                TotalReceitas = totalReceitas,
                TotalDespesas = totalDespesas,
                SaldoProjetado = saldoProjetado
            });
        }

        // PUT: api/Transacoes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTransacao(int id, Transacao transacao)
        {
            // Garante que o ID da URL é o mesmo ID do corpo da requisição
            if (id != transacao.Id)
            {
                return BadRequest("O ID da URL não bate com o ID da transação.");
            }

            _context.Entry(transacao).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Transacoes.Any(e => e.Id == id))
                {
                    return NotFound("Transação não encontrada.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent(); // 204 NoContent indica que deu certo, mas não precisa retornar dados
        }

        // DELETE: api/Transacoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransacao(int id)
        {
            var transacao = await _context.Transacoes.FindAsync(id);
            if (transacao == null)
            {
                return NotFound("Transação não encontrada.");
            }

            _context.Transacoes.Remove(transacao);
            await _context.SaveChangesAsync();

            return NoContent(); // 204 NoContent indica que deletou com sucesso
        }
    }
}