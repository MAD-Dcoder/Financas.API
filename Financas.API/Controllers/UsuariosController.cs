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
using Microsoft.Extensions.Configuration;

namespace Financas.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public UsuariosController(AppDbContext context, IConfiguration configuration)
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
            string hashSenha = BCrypt.Net.BCrypt.HashPassword(usuario.SenhaHash);
            usuario.SenhaHash = hashSenha;

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            usuario.SenhaHash = "";
            var token = GerarTokenJwt(usuario);

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

            if (usuario.SenhaHash.StartsWith("$2"))
            {
                senhaValida = BCrypt.Net.BCrypt.Verify(loginInfo.SenhaHash, usuario.SenhaHash);
            }
            else
            {
                if (usuario.SenhaHash == loginInfo.SenhaHash)
                {
                    senhaValida = true;
                    usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(loginInfo.SenhaHash);
                    await _context.SaveChangesAsync();
                }
            }

            if (!senhaValida)
            {
                return Unauthorized(new { message = "E-mail ou senha inválidos." });
            }

            usuario.SenhaHash = "";
            var token = GerarTokenJwt(usuario);

            return Ok(new { token = token, usuario = usuario });
        }

        // ==========================================
        // 3. MÉTODOS AUXILIARES: FÁBRICA DE TOKEN
        // ==========================================
        private string GerarTokenJwt(Usuario usuario)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"];
            var key = Encoding.ASCII.GetBytes(jwtKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                    new Claim(ClaimTypes.Email, usuario.Email)
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // ==========================================
        // 4. ROTA DE ATUALIZAÇÃO DE PERFIL (FIRMO 1.0.1v)
        // ==========================================
        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarPerfil(int id, [FromBody] AtualizarPerfilDto dto)
        {
            // Busca o usuário no banco
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return NotFound(new { message = "Usuário não encontrado." });
            }

            // Mapeia os dados recebidos para o usuário (respeitando os nomes do seu BD)
            usuario.DataNascimento = dto.DataNascimento;
            usuario.ConfiguracaoMoradia = dto.ConfiguracaoMoradia;
            usuario.Profissao = dto.Profissao;
            usuario.ObjetivoFinanceiro = dto.ObjetivoFinanceiro;
            usuario.PossuiVeiculo = dto.PossuiVeiculo;
            usuario.MomentoVida = dto.MomentoVida;
            usuario.MaiorPecado = dto.MaiorPecado;
            usuario.UsoCartao = dto.UsoCartao;
            usuario.NivelConhecimento = dto.NivelConhecimento;

            try
            {
                await _context.SaveChangesAsync();

                // Limpa a senha antes de devolver os dados atualizados para o Front-End
                usuario.SenhaHash = "";
                return Ok(usuario);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar o perfil.", erro = ex.Message });
            }
        }
    }

    // ==========================================
    // DTO: MODELO DE DADOS ESPERADO NO PUT
    // ==========================================
    public class AtualizarPerfilDto
    {
        public DateTime? DataNascimento { get; set; }
        public string ConfiguracaoMoradia { get; set; }
        public string Profissao { get; set; }
        public string MomentoVida { get; set; }
        public string ObjetivoFinanceiro { get; set; }

        public string PossuiVeiculo { get; set; }

        public string MaiorPecado { get; set; }
        public string UsoCartao { get; set; }
        public string NivelConhecimento { get; set; }
    }
}