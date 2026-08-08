using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Financas.API.Models;

[Table("contas")]
public class Conta
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("usuario_id")]
    public int UsuarioId { get; set; }

    [Column("nome")]
    public string Nome { get; set; } = string.Empty;

    [Column("tipo")]
    public TipoConta Tipo { get; set; } = TipoConta.corrente;
}