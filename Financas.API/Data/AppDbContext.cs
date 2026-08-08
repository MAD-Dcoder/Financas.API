using Financas.API.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL;

namespace Financas.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Transacao> Transacoes => Set<Transacao>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Conta> Contas => Set<Conta>(); // <- Nova tabela

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Enums de Transação
        modelBuilder.HasPostgresEnum<TipoTransacao>("tipo_transacao");
        modelBuilder.Entity<Transacao>()
            .Property(t => t.Tipo)
            .HasColumnType("tipo_transacao");

        // Enums de Conta (Novo)
        modelBuilder.HasPostgresEnum<TipoConta>("tipo_conta");
        modelBuilder.Entity<Conta>()
            .Property(c => c.Tipo)
            .HasColumnType("tipo_conta");

        base.OnModelCreating(modelBuilder);
    }
}