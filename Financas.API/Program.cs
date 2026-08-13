using Financas.API.Data;
using Financas.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Adicione esta linha exata para o Render mandar o tráfego para a porta correta:
builder.WebHost.UseUrls("http://0.0.0.0:" + (Environment.GetEnvironmentVariable("PORT") ?? "8080"));

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
            o.MapEnum<TipoConta>("tipo_conta");
        }
    ));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuração do CORS para permitir que o Front-end acesse a API
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontEnd", policy =>
    {
        // Libera acesso apenas para o seu ambiente local e para a nuvem
        policy.WithOrigins("http://localhost:5173", "https://firmo-app.vercel.app")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ==========================================
// INÍCIO DA CONFIGURAÇÃO JWT
// ==========================================
var jwtKey = builder.Configuration["Jwt:Key"]; // <-- LENDO DO COFRE (appsettings.Development.json)
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});
// ==========================================
// FIM DA CONFIGURAÇÃO JWT
// ==========================================

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Aplica a política de CORS criada lá em cima
app.UseCors("PermitirFrontEnd");

// IMPORTANTE: Authentication vem antes de Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();