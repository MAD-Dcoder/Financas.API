using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Financas.API.Data;
using Financas.API.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Financas.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
            return await _context.Usuarios.ToListAsync();
        }

        // ==========================================
        // 1. ROTA DE CADASTRO (CRIPTOGRAFANDO A SENHA)
        // ==========================================
        [HttpPost]
        public async Task<ActionResult<Usuario>> PostUsuario(Usuario usuario)
        {
            // Pega a senha limpa que veio do React (ex: "123456") e transforma num Hash irreversível
            string hashSenha = BCrypt.Net.BCrypt.HashPassword(usuario.SenhaHash);

            // Substitui a senha limpa pelo Hash antes de mandar pro banco
            usuario.SenhaHash = hashSenha;

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            // Ocultar a senha no retorno por segurança
            usuario.SenhaHash = "";

            return CreatedAtAction(nameof(GetUsuarios), new { id = usuario.Id }, usuario);
        }

        // ==========================================
        // 2. ROTA DE LOGIN (COM MIGRAÇÃO DE CONTAS ANTIGAS)
        // ==========================================
        [HttpPost("login")]
        public async Task<ActionResult<Usuario>> Login([FromBody] Usuario loginInfo)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == loginInfo.Email);

            if (usuario == null)
            {
                return Unauthorized(new { message = "E-mail ou senha inválidos." });
            }

            bool senhaValida = false;

            // 1. Verifica se a senha no banco JÁ É criptografada (Hashes BCrypt começam com $2)
            if (usuario.SenhaHash.StartsWith("$2"))
            {
                senhaValida = BCrypt.Net.BCrypt.Verify(loginInfo.SenhaHash, usuario.SenhaHash);
            }
            else
            {
                // 2. FALLBACK (Para contas antigas como o seu ID 1)
                if (usuario.SenhaHash == loginInfo.SenhaHash)
                {
                    senhaValida = true;

                    // MÁGICA: Já que ele logou com sucesso, atualizamos a senha dele no banco para Criptografada!
                    usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(loginInfo.SenhaHash);
                    await _context.SaveChangesAsync();
                }
            }

            // Se errou a senha em qualquer um dos cenários, bloqueia
            if (!senhaValida)
            {
                return Unauthorized(new { message = "E-mail ou senha inválidos." });
            }

            // Limpa o hash para não trafegar na rede e autoriza o React
            usuario.SenhaHash = "";
            return Ok(usuario);
        }
    }
}  