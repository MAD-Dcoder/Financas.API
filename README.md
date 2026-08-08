# 💰 Financas.API & App

> Um ecossistema completo de gerenciamento de finanças pessoais desenvolvido com arquitetura moderna, unindo uma API robusta em C#/.NET a uma interface mobile-first de alta performance construída em React.

---

## 🚀 Sobre o Projeto

O **Financas.API** nasceu para resolver o controle financeiro do dia a dia com foco total em experiência do usuário (UX/UI) e performance. O sistema conta com um painel dinâmico em estilo *Dark Mode Tech*, suporte a gráficos de distribuição de despesas em tempo real, cálculos automáticos de saldo, mascaramento inteligente de moeda e gavetas interativas (*Bottom Sheets*) para lançamentos rápidos.

---

## 🛠️ Tecnologias Utilizadas

### **Back-end (API)**
* **C# / .NET** — Linguagem e plataforma principal.
* **Entity Framework Core** — ORM para mapeamento e persistência de dados.
* **PostgreSQL** — Banco de dados relacional robusto.
* **Npgsql** — Driver oficial com suporte nativo a tipos `Enum` mapeados (`tipo_transacao`).
* **Swagger / OpenAPI** — Documentação e testes interativos dos endpoints.

### **Front-end (Interface)**
* **React.js (com Vite)** — Biblioteca reativa de alta performance.
* **Bootstrap & React Bootstrap** — Framework CSS para estruturação responsiva.
* **React Icons** — Iconografia minimalista e moderna.
* **Axios** — Cliente HTTP para comunicação assíncrona com a API.

---

## ⚙️ Funcionalidades Principais

* **Gestão Dinâmica de Transações:** Cadastro ágil de receitas e despesas com categorização inteligente (*Moto, Alimentação, Salário, Vale, etc.*), formas de pagamento (*Pix, Crédito, Débito, Dinheiro*) e campos dedicados a observações.
* **Dashboard em Tempo Real:** Cálculo automático de saldo atual, receitas e despesas com base nos lançamentos, incluindo um gráfico de rosca dinâmico para distribuição de gastos.
* **Modo de Privacidade (Blackout):** Alternância rápida para ocultar valores sensíveis em público com um único toque no ícone de visualização.
* **Mapeamento Avançado de Dados:** Integração transparente entre enums do PostgreSQL e tipagem forte do C#.

---

## 📦 Como Executar o Projeto

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
* [.NET SDK](https://dotnet.microsoft.com/) (Versão 8.0 ou superior)
* [Node.js](https://nodejs.org/) (Para rodar o ambiente front-end)
* [PostgreSQL](https://www.postgresql.org/) (Rodando localmente ou em servidor remoto)
