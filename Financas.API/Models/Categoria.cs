using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Financas.API.Models;

[Table("categorias")]
public class Categoria
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("nome")]
    public string Nome { get; set; } = string.Empty;

    [Column("usuario_id")]
    public int UsuarioId { get; set; }

    [Column("tipo")]
    public TipoTransacao Tipo { get; set; }

    [Column("cor_hex")]
    public string? CorHex { get; set; }

    [Column("criado_em")]
    public DateTime CriadoEm { get; set; }

    [Column("ordem")]
    public int Ordem { get; set; }

    [Column("ativo")]
    public bool Ativo { get; set; }
}