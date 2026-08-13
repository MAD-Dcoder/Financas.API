using System;

namespace Financas.API.Models;

public class Planejamento
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int CategoriaId { get; set; }
    public decimal ValorLimite { get; set; }
    public DateTime MesAno { get; set; }
}