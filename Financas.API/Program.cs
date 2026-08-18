using Financas.API.Data;
using Financas.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// --- CORREÇÃO PARA O RENDER ---
var options = new WebApplicationOptions
{
    Args = args,
    WebRootPath = "wwwroot"
};

var builder = WebApplication.CreateBuilder(options);

// Desativa o recarregamento automático para evitar erro de limite de inotify no Linux do Render
builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: false);
builder.Configuration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: false);

// Configuração de portas: Dinâmica no Render, padrão do Visual Studio em Desenvolvimento
if (!builder.Environment.IsDevelopment())
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
    builder.WebHost.UseUrls("http://0.0.0.0:" + port);
}
// ------------------------------

// Permite aceitar os enums como texto no Swagger/JSON
builder.Services.AddControllers()
    .AddJsonOptions(jsonOptions =>
    {
        jsonOptions.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Configura a conexão e o mapeamento dos Enums com o Postgres
builder.Services.AddDbContext<AppDbContext>(dbOptions =>
    dbOptions.UseNpgsql(
        builder.Configuration.GetConnectionString("PostgresConnection"),
        o =>
        {
            o.MapEnum<TipoTransacao>("tipo_transacao");
            o.MapEnum<TipoConta>("tipo_conta");
        }
    ));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ==========================================
// CONFIGURAÇÃO DO CORS (ATUALIZADA)
// ==========================================
builder.Services.AddCors(corsOptions =>
{
    corsOptions.AddPolicy("PermitirFrontEnd", policy =>
    {
        // AllowAnyOrigin resolve definitivamente o bloqueio da Vercel
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ==========================================
// INÍCIO DA CONFIGURAÇÃO JWT
// ==========================================
var jwtKey = builder.Configuration["Jwt:Key"];
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

// Aplica o CORS (Deve vir antes do UseAuthentication)
app.UseCors("PermitirFrontEnd");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();