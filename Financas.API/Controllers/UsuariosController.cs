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
using System.Linq;
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

        // ==========================================
        // MÉTODOS AUXILIARES: MAPEAMENTO SEGURO (DTO)
        // ==========================================
        private UsuarioRetornoDto MapearParaDto(Usuario usuario)
        {
            return new UsuarioRetornoDto
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                DataNascimento = usuario.DataNascimento,
                ConfiguracaoMoradia = usuario.ConfiguracaoMoradia,
                Profissao = usuario.Profissao,
                MomentoVida = usuario.MomentoVida,
                ObjetivoFinanceiro = usuario.ObjetivoFinanceiro,
                PossuiVeiculo = usuario.PossuiVeiculo,
                MaiorPecado = usuario.MaiorPecado,
                UsoCartao = usuario.UsoCartao,
                NivelConhecimento = usuario.NivelConhecimento
            };
        }

        // GET: api/Usuarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsuarioRetornoDto>>> GetUsuarios()
        {
            var usuarios = await _context.Usuarios.ToListAsync();
            var usuariosSeguros = usuarios.Select(u => MapearParaDto(u));
            return Ok(usuariosSeguros);
        }

        // ==========================================
        // ROTA DE BUSCA DE USUÁRIO POR ID
        // ==========================================
        [HttpGet("{id}")]
        public async Task<ActionResult<UsuarioRetornoDto>> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return NotFound(new { message = "Usuário não encontrado." });
            }

            return Ok(MapearParaDto(usuario));
        }

        // ==========================================
        // 1. ROTA DE CADASTRO
        // ==========================================
        [HttpPost]
        public async Task<ActionResult> PostUsuario(Usuario usuario)
        {
            string hashSenha = BCrypt.Net.BCrypt.HashPassword(usuario.SenhaHash);
            usuario.SenhaHash = hashSenha;

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var token = GerarTokenJwt(usuario);

            return Ok(new { token = token, usuario = MapearParaDto(usuario) });
        }

        // ==========================================
        // 2. ROTA DE LOGIN
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

            var token = GerarTokenJwt(usuario);
            return Ok(new { token = token, usuario = MapearParaDto(usuario) });
        }

        // ==========================================
        // 5. ROTA DE RECUPERAÇÃO DE SENHA (TEMPORÁRIO)
        // ==========================================
        [HttpPost("reset-temporario")]
        public async Task<IActionResult> ResetTemporario([FromBody] ResetTemporarioDto dto)
        {
            const string CHAVE_ESPERADA = "FIRMO_BETA_2026";

            // Tratamento contra nulos e espaços fantasmas
            if (string.IsNullOrWhiteSpace(dto.ChaveMestra) || dto.ChaveMestra.Trim() != CHAVE_ESPERADA)
            {
                return Unauthorized(new { message = "Código de segurança inválido." });
            }

            var emailLimpo = dto.Email?.Trim();

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == emailLimpo);

            if (usuario == null)
            {
                return NotFound(new { message = "Usuário não encontrado." });
            }

            // Aplica o hash na nova senha
            usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Senha atualizada com sucesso." });
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
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return NotFound(new { message = "Usuário não encontrado." });
            }

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
                return Ok(MapearParaDto(usuario));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar o perfil.", erro = ex.Message });
            }
        }
    }

    // ==========================================
    // DTOs (Data Transfer Objects)
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

    public class UsuarioRetornoDto
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
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

    // NOVO DTO PARA RESET DE SENHA
    public class ResetTemporarioDto
    {
        public string Email { get; set; }
        public string NovaSenha { get; set; }
        public string ChaveMestra { get; set; }
    }
}