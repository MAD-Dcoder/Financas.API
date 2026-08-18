using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Financas.API.Models;

[Table("transacoes")]
public class Transacao
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("usuario_id")]
    public int UsuarioId { get; set; }

    [Column("conta_origem_id")]
    public int ContaOrigemId { get; set; }

    [Column("conta_destino_id")]
    public int? ContaDestinoId { get; set; }

    [Column("categoria_id")]
    public int? CategoriaId { get; set; }

    [Column("descricao")]
    public string Descricao { get; set; } = string.Empty;

    [Column("valor")]
    public decimal Valor { get; set; }

    [Column("tipo")]
    public TipoTransacao Tipo { get; set; } = TipoTransacao.despesa;

    [Column("cartao_id")]
    public int? CartaoId { get; set; }

    [Column("data_transacao")]
    public DateTime DataTransacao { get; set; }

    [Column("pago")]
    public bool Pago { get; set; } = true;

    [Column("eh_recorrente")]
    public bool EhRecorrente { get; set; }

    [Column("observacao")]
    public string? Observacao { get; set; }
}