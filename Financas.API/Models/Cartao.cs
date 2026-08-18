using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Financas.API.Models
{
    [Table("cartoes")]
    public class Cartao
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("usuario_id")]
        public int UsuarioId { get; set; }

        [Required]
        [Column("nome")]
        public string Nome { get; set; }

        [Column("ultimos_digitos")]
        public string? UltimosDigitos { get; set; }

        [Column("bandeira")]
        public string? Bandeira { get; set; }

        [Required]
        [Column("limite_total")]
        public decimal LimiteTotal { get; set; }

        [Required]
        [Column("dia_vencimento")]
        public int DiaVencimento { get; set; }

        [Required]
        [Column("dia_fechamento")]
        public int DiaFechamento { get; set; }

        [Column("cor_fundo")]
        public string? CorFundo { get; set; } = "#1E1E1E";

        [Column("cor_texto")]
        public string? CorTexto { get; set; } = "#FFFFFF";

        [Column("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        [Column("atualizado_em")]
        public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
    }
}