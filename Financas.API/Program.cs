using Financas.API.Data;
using Financas.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Permite aceitar os enums como texto no Swagger/JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Configura a conexão e o mapeamento dos Enums com o Postgres
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("PostgresConnection"),
        o =>
        {
            o.MapEnum<TipoTransacao>("tipo_transacao");
            o.MapEnum<TipoConta>("tipo_conta"); // <-- A NOVA ATUALIZAÇÃO AQUI
        }
    ));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();