```markdown
# C4 - Contexto e Contêineres (resumo em texto)

Data: 2025-11-04

Objetivo: descrever de forma concisa os limites do sistema, atores principais e os containers que compõem a solução (backend API, frontend mobile/web, banco de dados).

## 1. Diagrama de Contexto (nível 1)

[Usuário (Mobile/Web)] --> (App Frontend) : usa
[Admin] --> (App Frontend) : usa/gera_reports
(App Frontend) --> (Backend API) : solicita dados / operações (REST)
(Backend API) --> (MySQL Database) : persistência (read/write)
(Backend API) --> (Email Provider) : envia notificações (opcional)

Descrição textual:
- Ator primário: Usuário final (aplicativo móvel/SPA web) que consome as funcionalidades financeiras (visualizar saldo, criar lançamentos, categorias).
- Sistema: Tech_Academy_7 composto por Frontend (React/Expo), Backend (Node.js + TypeScript API REST), e um banco relacional (MySQL/MariaDB).
- Sistemas externos: serviço de e-mail (SMTP ou provider), provedor de autenticação (se houver), serviço de métricas/observability (ex.: Prometheus/Datadog).

## 2. Diagrama de Contêiner (nível 2)

Containers principais:

- Frontend (Mobile / Web)
  - Tipo: Aplicação React Native / Next/Expo (cliente)
  - Responsabilidades: UI, validação básica, autenticação via API, apresentação de dados e navegação.
  - Tecnologia: React Native / Expo, JavaScript/TypeScript.

- Backend API (Node.js)
  - Tipo: API REST em Node.js + TypeScript
  - Responsabilidades: Regras de domínio (FinancialService), autenticação/autorização, validação, orquestração de repositórios, exposição de endpoints REST, geração de tokens, validação de permissão.
  - Tecnologia: Node.js, Express/Koa (ver `src/app.ts`), Sequelize como ORM.

- Banco de Dados Relacional
  - Tipo: MySQL/MariaDB
  - Responsabilidades: armazenamento de Users, Categories, Transactions, FinancialAccount.

- Infra/Operação (Containers & CI)
  - Docker images para backend e frontend; GitHub Actions para CI/CD; Trivy/Scanners na pipeline.

## 3. Fluxos principais (resumo)

1. Login e Autenticação
   - Frontend -> Backend: POST /login (user/pass)
   - Backend: valida credenciais, retorna JWT (ou session cookie)

2. Consulta de saldo
   - Frontend -> Backend: GET /accounts/:id/saldo
   - Backend -> DB: SELECT saldo

3. Criação de transação
   - Frontend -> Backend: POST /transactions
   - Backend: valida regras de domínio (FinancialService), persiste transação e atualiza saldo.

## 4. Observações de segurança e operações

- Comunicação deve ser sempre via HTTPS/TLS.
- Tokens JWT ou sessions devem ter expiração curta e refresh token quando aplicável.
- Banco de dados protegido em rede privada, backups e user com privilégios mínimos.

---
Arquivo criado automaticamente para documentação arquitetural. Para diagramas visuais, exportar para ferramentas (Diagrams.net, Structurizr) usando estas notas como fonte.
```
