# 💰 Financas.API & App

> Sistema completo de gestão financeira pessoal composto por uma API RESTful em C# (.NET) e uma interface web/mobile-first reativa em React, integrando banco de dados relacional e infraestrutura na nuvem.

---

## 🛠️ Tecnologias & Arquitetura

### ⚙️ Back-end (API)
* **C# / .NET 8** — Plataforma principal da API.
* **Entity Framework Core & Npgsql** — ORM e driver PostgreSQL com suporte nativo a tipos `Enum`.
* **JWT (JSON Web Token)** — Autenticação stateless para proteção de rotas.
* **Swagger / OpenAPI** — Documentação e testes de endpoints em desenvolvimento.
* **Render** — Hospedagem automatizada em container Linux.

### 🎨 Front-end (Interface)
* **React.js (Vite)** — Interface reativa e performática.
* **Bootstrap 5 & React Icons** — Design responsivo no estilo *Dark Mode Tech*.
* **Axios** — Consumo assíncrono da API com envio dinâmico de cabeçalhos de autenticação.
* **Vercel** — Deploy contínuo e distribuição global do front-end.

### ☁️ Banco de Dados & Nuvem
* **PostgreSQL (Supabase)** — Banco relacional hospedado em nuvem com gerenciamento via DBeaver.

---

## 🔐 Segurança & Boas Práticas

* **Autenticação JWT:** Acesso restrito a rotas protegidas exigindo token Bearer válido por sessão.
* **Variáveis de Ambiente (`Environment Variables`):** Isolamento total de credenciais sensíveis (chaves JWT e *Connection Strings*) fora do código-fonte e do histórico do Git.
* **Política de CORS Configurada:** Permissões de acesso controladas entre a API no Render e o Front-end na Vercel.
* **Proteção contra SQL Injection:** Consultas parametrizadas via Entity Framework Core.

---

## ⚙️ Funcionalidades Principais

* **Gestão de Transações:** Lançamento de receitas e despesas com valor, data, forma de pagamento, observações e categorização.
* **Dashboard Financeiro:** Cálculo em tempo real do saldo livre, total de receitas, despesas do mês e gráfico dinâmico por categoria.
* **Privacidade Visual:** Alternância rápida com um clique para mascarar valores sensíveis na tela.
* **Filtros e Histórico:** Listagem cronológica de transações com suporte a parcelamentos/recorrências.

---
