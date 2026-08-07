# Financas.API 💰

Uma API RESTful desenvolvida em C# e .NET para o gerenciamento de finanças pessoais. O sistema permite o controle de receitas e despesas, além de calcular projeções de saldo baseadas no histórico financeiro.

## 🚀 Tecnologias Utilizadas

* **C# / .NET** (Plataforma e linguagem principal)
* **Entity Framework Core** (ORM para mapeamento e consultas ao banco de dados)
* **PostgreSQL** (Banco de dados relacional)
* **Npgsql** (Driver do PostgreSQL para .NET com suporte nativo a tipos `Enum`)
* **Swagger / OpenAPI** (Interface para documentação e testes da API)

## ⚙️ Funcionalidades Atuais

* **Gestão de Transações:** Cadastro de receitas e despesas com categorização e vínculo direto a contas bancárias.
* **Projeção de Saldo:** Endpoint dedicado ao cálculo dinâmico do saldo final projetado para um período específico, abatendo automaticamente despesas das receitas cadastradas.
* **Mapeamento Avançado de Dados:** Utilização de `Enums` nativos do PostgreSQL (`tipo_transacao`) integrados de forma transparente com a tipagem forte do C#.
* **Integridade Relacional:** Transações vinculadas estritamente a Usuários e Contas (Foreign Keys).

## 🛠️ Como Executar o Projeto

### Pré-requisitos
* [.NET SDK](https://dotnet.microsoft.com/download) (versão 8.0 ou superior) instalado.
* [PostgreSQL](https://www.postgresql.org/download/) rodando localmente ou em servidor remoto.
* Um editor de código como [Visual Studio](https://visualstudio.microsoft.com/) ou [VS Code](https://code.visualstudio.com/).

### Configuração e Execução

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
