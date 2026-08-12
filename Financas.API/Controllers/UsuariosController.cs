using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Financas.API.Data;
using Financas.API.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System;
using Microsoft.Extensions.Configuration; // <-- Biblioteca do cofre

namespace Financas.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration; // <-- Variável do cofre

        public UsuariosController(AppDbContext context, IConfiguration configuration) // <-- Injeção de Dependência do cofre
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/Usuarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {
            return await _context.Usuarios.ToListAsync();
        }

        // ==========================================
        // 1. ROTA DE CADASTRO (CRIPTOGRAFANDO A SENHA E GERANDO TOKEN)
        // ==========================================
        [HttpPost]
        public async Task<ActionResult> PostUsuario(Usuario usuario)
        {
            // Pega a senha limpa que veio do React (ex: "123456") e transforma num Hash irreversível
            string hashSenha = BCrypt.Net.BCrypt.HashPassword(usuario.SenhaHash);

            // Substitui a senha limpa pelo Hash antes de mandar pro banco
            usuario.SenhaHash = hashSenha;

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            // Ocultar a senha no retorno por segurança
            usuario.SenhaHash = "";

            // Gera o Token JWT da pulseira VIP
            var token = GerarTokenJwt(usuario);

            // Devolve exatamente o pacote que o React espera
            return Ok(new { token = token, usuario = usuario });
        }

        // ==========================================
        // 2. ROTA DE LOGIN (COM MIGRAÇÃO E GERANDO TOKEN)
        // ==========================================
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] Usuario loginInfo)
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

            // Limpa o hash para não trafegar na rede
            usuario.SenhaHash = "";

            // Gera o Token JWT da pulseira VIP
            var token = GerarTokenJwt(usuario);

            // Devolve exatamente o pacote que o React espera
            return Ok(new { token = token, usuario = usuario });
        }

        // ==========================================
        // 3. MÉTODOS AUXILIARES: FÁBRICA DE TOKEN
        // ==========================================
        private string GerarTokenJwt(Usuario usuario)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            // Lendo a chave diretamente do appsettings.json!
            var jwtKey = _configuration["Jwt:Key"];
            var key = Encoding.ASCII.GetBytes(jwtKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                    new Claim(ClaimTypes.Email, usuario.Email)
                }),
                Expires = DateTime.UtcNow.AddHours(8), // Token vale por 8 horas
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}