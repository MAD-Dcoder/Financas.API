using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Financas.API.Models
{
    [Table("usuarios")]
    public class Usuario
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nome")]
        public string Nome { get; set; } = string.Empty;

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("senha_hash")]
        public string SenhaHash { get; set; } = string.Empty;

        // AQUI ESTÁ A CORREÇÃO:
        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        // ==========================================
        // DADOS DO PERFIL (FIRMO 1.0.1v)
        // ==========================================

        [Column("data_nascimento")]
        public DateTime? DataNascimento { get; set; }

        [Column("profissao")]
        public string? Profissao { get; set; }

        [Column("configuracao_moradia")]
        public string? ConfiguracaoMoradia { get; set; }

        [Column("objetivo_financeiro")]
        public string? ObjetivoFinanceiro { get; set; }

        [Column("possui_veiculo")]
        public string? PossuiVeiculo { get; set; }

        [Column("momento_vida")]
        public string? MomentoVida { get; set; }

        [Column("maior_pecado")]
        public string? MaiorPecado { get; set; }

        [Column("uso_cartao")]
        public string? UsoCartao { get; set; }

        [Column("nivel_conhecimento")]
        public string? NivelConhecimento { get; set; }
    }
}