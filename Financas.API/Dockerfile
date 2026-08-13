# Usa a imagem oficial do SDK do .NET 10 para construir o projeto
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copia o arquivo do projeto e restaura as dependências
COPY ["Financas.API.csproj", "./"]
RUN dotnet restore "Financas.API.csproj"

# Copia o resto do código e publica a aplicação
COPY . .
RUN dotnet publish "Financas.API.csproj" -c Release -o /app/publish

# Usa a imagem mais leve do ASP.NET para rodar a aplicação otimizada
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .

# Comando que dá o start na API
ENTRYPOINT ["dotnet", "Financas.API.dll"]