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
        // Esta função pega um Usuario do banco e transforma no DTO seguro, deixando a SenhaHash de fora.
        private UsuarioRetornoDto MapearParaDto(Usuario usuario)
        {
            return new UsuarioRetornoDto
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                // CriadoEm = usuario.CriadoEm, // Descomente se tiver essa propriedade no seu model
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

            // Converte a lista de entidades para a lista de DTOs seguros
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

            // Retorna apenas o DTO mapeado
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

            // Retorna o token e o usuário blindado
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

            // Retorna o token e o usuário blindado
            return Ok(new { token = token, usuario = MapearParaDto(usuario) });
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

                // Retorna apenas o DTO mapeado
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

    // DTO usado para RECEBER dados de atualização
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

    // DTO usado para ENVIAR dados seguros para o Frontend
    public class UsuarioRetornoDto
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        // public DateTime CriadoEm { get; set; } // Descomente caso exista
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