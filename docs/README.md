# 📚 Documentação Técnica - Tech Academy 7

## 📋 Índice de Entregas

Este repositório contém toda a documentação técnica organizada por critérios de entrega.

---

## 1️⃣ Documentação Arquitetural (0,5 pontos)

📁 **Localização:** `docs/01-arquitetura/`

### Conteúdo:
- ✅ **Diagramas C4** (Contexto e Containers)
  - `01-c4-context-and-containers.md` - Diagramas iniciais
  - `02-c4-component-diagram.md` - Diagrama de componentes

- ✅ **ADRs** (Architecture Decision Records)
  - `adr/0001-choose-database.md` - Decisão: MySQL como banco de dados
  - `adr/0002-authentication-and-authorization.md` - Decisão: JWT + RBAC
  - `adr/0003-observability-and-logging.md` - Decisão: Pino para logs estruturados

- ✅ **Quality Scenarios**
  - `05-qualidade-cenarios.md` - Cenários de desempenho e disponibilidade

---

## 2️⃣ Estilos Arquiteturais e DDD (0,8 pontos)

📁 **Localização:** `docs/02-ddd/`

### Conteúdo:
- ✅ **Context Map**
  - `CONTEXT_MAP.md` - Identificação de domínios e subdomínios

- ✅ **Bounded Contexts**
  - `DDD_IMPLEMENTATION.md` - Definição de contextos delimitados

- ✅ **Tactical DDD**
  - `03-ddd-entities-value-objects.md` - Entities, Value Objects e Aggregates
  - Implementação prática em `backend/src/domain/`

**Bounded Contexts do Projeto:**
- 🏦 **Financial Context** (Contexto Financeiro)
- 👤 **User Context** (Contexto de Usuários)

---

## 3️⃣ Integração, APIs e Dados (0,3 pontos)

📁 **Localização:** `docs/03-apis-dados/`

### Conteúdo:
- ✅ **Especificação OpenAPI**
  - `openapi.yaml` - Documentação Swagger completa dos endpoints

- ✅ **ADR de Banco de Dados**
  - `../01-arquitetura/adr/0001-choose-database.md` - Justificativa da escolha do MySQL

**Endpoints Principais:**
- `POST /auth/register` - Cadastro de usuários
- `POST /auth/login` - Autenticação JWT
- `GET /saldo/:userId` - Consulta de saldo (com cache)
- `POST /saldo/:userId/transaction` - Nova transação
- `POST /users/photo` - Upload de foto (Multer)

---

## 4️⃣ Atributos de Qualidade, Resiliência e Observabilidade (1,0 ponto)

📁 **Localização:** `docs/04-qualidade-resiliencia-observabilidade/`

### Conteúdo:
- ✅ **SLOs/SLIs**
  - `02-slos-slis.md` - Service Level Objectives e Indicators

- ✅ **Estratégias de Resiliência**
  - `03-estrategias-resiliencia.md` - Retry, timeout, circuit breaker

- ✅ **Plano de Observabilidade**
  - `04-plano-observabilidade.md` - Métricas e logs coletados
  - `BOAS_PRATICAS_LOCALIZACAO.md` - Onde encontrar logs no código

- ✅ **Atributos de Qualidade**
  - `01-atributos-qualidade.md` - Desempenho, disponibilidade, segurança

**Implementações:**
- 📊 Pino Logger (JSON estruturado) em `backend/src/utils/logger.ts`
- 🔄 Circuit Breaker em `backend/src/utils/circuitBreaker.ts`
- 📈 Métricas Prometheus em `backend/src/middleware/metrics.ts`
- 💾 Cache Redis com TTL em `backend/src/utils/cacheManager.ts`

---

## 5️⃣ Segurança e DevSecOps (0,7 pontos)

📁 **Localização:** `docs/05-seguranca-devsecops/`

### Conteúdo:
- ✅ **Threat Model**
  - `threat-model.md` - Modelo de ameaças (login e transações)

- ✅ **Autenticação/Autorização**
  - `security-and-cicd.md` - Estratégia de RBAC (Role-Based Access Control)
  - `../01-arquitetura/adr/0002-authentication-and-authorization.md` - ADR de Auth

- ✅ **Checklist de Segurança**
  - `security-and-cicd.md` - Pipeline com análise de dependências

**Implementações:**
- 🔐 JWT com roles (user/admin) em `backend/src/middleware/authMiddleware.ts`
- 🛡️ Validação de entrada em todos os controllers
- 🔒 HTTPS, CORS, Helmet configurados
- 📸 Validação de upload (Multer) em `backend/src/middleware/uploadMiddleware.ts`

---

## 6️⃣ Entrega Contínua (0,7 pontos)

📁 **Localização:** `docs/06-ci-cd/`

### Conteúdo:
- ✅ **Pipeline CI/CD**
  - `CI_CD_PIPELINE.md` - Pipeline GitHub Actions (build, test, deploy)

- ✅ **Estratégia de Deploy**
  - Blue/Green deployment descrito no pipeline

- ✅ **Runbook de Incidentes**
  - Incluído no documento de CI/CD

**Arquivo Pipeline:**
- `.github/workflows/ci-cd.yml` (se existir no projeto)

---

## 7️⃣ Back-end Avançado (4,0 pontos)

📁 **Localização:** `docs/07-backend-avancado/`

### Conteúdo:

#### a) Cache Distribuído com Redis (1,0 ponto)
- ✅ **Implementação cache-aside** em `backend/src/utils/cacheManager.ts`
- ✅ **TTL configurado** (5 minutos para saldo)
- ✅ **Invalidação em updates** (transaction added)
- ✅ **Logs de HIT/MISS**

**Código:** `backend/src/controllers/saldoControllerEnhanced.ts`

#### b) Mensageria e Pub/Sub (1,0 ponto)
- ✅ **Redis Pub/Sub** em `backend/src/utils/eventBus.ts`
- ✅ **Eventos publicados:**
  - `transaction.added` - Nova transação
  - `alert.balance_low` - Saldo baixo
  - `alert.expense_excessive` - Gasto excessivo
  - `balance.updated` - Saldo atualizado

**Documentação:** `TESTE_REDIS_PUBSUB.md`

**Código:** `backend/src/domain/handlers/EventHandlers.ts`

#### c) Docker Compose + Nginx (0,5 pontos)
- ✅ **Orquestração de 5 containers:**
  - MySQL
  - Redis
  - Backend (Node.js)
  - Frontend (Expo Web)
  - Nginx (Reverse Proxy)

**Documentação:** `DOCKER_NGINX_DEMO.md`

**Arquivos:**
- `docker-compose.yml`
- `frontend/nginx.conf`
- Script de teste: `testDockerNginx.ps1`

#### d) Boas Práticas e Observabilidade (1,0 ponto)
- ✅ **Organização modular** (DDD, camadas)
- ✅ **Logs estruturados** (Pino com requestId)
- ✅ **Tratamento de erros** (try-catch, middleware global)

**Documentação:** `BOAS_PRATICAS_LOCALIZACAO.md` (também em `04-qualidade-resiliencia-observabilidade/`)

---

## 8️⃣ Tech Forge - Multer Upload (4,0 pontos)

📁 **Localização:** `docs/08-tech-forge-multer/`

### Conteúdo:

#### a) Recebendo e Salvando Imagens (1,0 ponto)
- ✅ **Multer configurado** em `backend/src/middleware/uploadMiddleware.ts`
- ✅ **DiskStorage** com path `backend/uploads/profiles/`
- ✅ **Routes:** `POST /users/photo`, `DELETE /users/photo`

#### b) Validações de Imagens (1,0 ponto)
- ✅ **Extensões permitidas:** .jpg, .jpeg, .png, .gif, .webp
- ✅ **Tamanho máximo:** 5MB
- ✅ **Colisão de nomes:** `crypto.randomBytes(16)` gera nomes únicos
- ✅ **Validação MIME type**

#### c) Controle de Acesso (2,0 pontos - estimado)
- ✅ **Roles:** `user` e `admin`
- ✅ **Middleware:** `authenticateToken`, `requireAdmin`, `requireOwnerOrAdmin`
- ✅ **Rotas protegidas:**
  - Upload: apenas o próprio usuário
  - Visualizar foto de outros: apenas admin
  - Deletar: apenas o próprio usuário

**Documentação:** `MULTER_UPLOAD_DOCS.md`

**Código:**
- `backend/src/middleware/uploadMiddleware.ts` (Multer + validações)
- `backend/src/middleware/authMiddleware.ts` (JWT + roles)
- `backend/src/controllers/userController.ts` (upload/delete/get)
- `frontend/app/perfil.tsx` (UI de upload)
- `frontend/app/ImagePickerWrapper.tsx` (Wrapper para web)

---

## 📂 Estrutura de Arquivos

```
docs/
├── README.md (este arquivo)
│
├── 01-arquitetura/
│   ├── 01-c4-context-and-containers.md
│   ├── 02-c4-component-diagram.md
│   ├── 05-qualidade-cenarios.md
│   └── adr/
│       ├── 0001-choose-database.md
│       ├── 0002-authentication-and-authorization.md
│       └── 0003-observability-and-logging.md
│
├── 02-ddd/
│   ├── CONTEXT_MAP.md
│   ├── DDD_IMPLEMENTATION.md
│   └── 03-ddd-entities-value-objects.md
│
├── 03-apis-dados/
│   └── openapi.yaml
│
├── 04-qualidade-resiliencia-observabilidade/
│   ├── 01-atributos-qualidade.md
│   ├── 02-slos-slis.md
│   ├── 03-estrategias-resiliencia.md
│   ├── 04-plano-observabilidade.md
│   └── BOAS_PRATICAS_LOCALIZACAO.md
│
├── 05-seguranca-devsecops/
│   ├── threat-model.md
│   └── security-and-cicd.md
│
├── 06-ci-cd/
│   └── CI_CD_PIPELINE.md
│
├── 07-backend-avancado/
│   ├── TESTE_REDIS_PUBSUB.md
│   └── DOCKER_NGINX_DEMO.md
│
└── 08-tech-forge-multer/
    └── MULTER_UPLOAD_DOCS.md
```

---

## 🚀 Como Navegar na Documentação

### Por Categoria de Entrega:
1. Acesse a pasta correspondente (ex: `01-arquitetura/`)
2. Leia os arquivos Markdown dentro dela

### Por Tópico Técnico:
- **Diagramas C4:** `01-arquitetura/`
- **DDD:** `02-ddd/`
- **APIs:** `03-apis-dados/openapi.yaml`
- **Observabilidade:** `04-qualidade-resiliencia-observabilidade/`
- **Segurança:** `05-seguranca-devsecops/`
- **CI/CD:** `06-ci-cd/`
- **Redis/Cache/Pub-Sub:** `07-backend-avancado/`
- **Multer:** `08-tech-forge-multer/`

### Localização do Código:
- **Backend:** `backend/src/`
- **Frontend:** `frontend/app/`
- **Docker:** `docker-compose.yml`, `frontend/nginx.conf`
- **Testes:** `backend/src/__tests__/`

---

## ✅ Checklist de Entregas

| Entrega | Pontos | Status | Localização |
|---------|--------|--------|-------------|
| 📐 Documentação Arquitetural | 0,5 | ✅ | `01-arquitetura/` |
| 🏗️ Estilos Arquiteturais e DDD | 0,8 | ✅ | `02-ddd/` |
| 🔌 Integração, APIs e Dados | 0,3 | ✅ | `03-apis-dados/` |
| 📊 Qualidade, Resiliência e Obs. | 1,0 | ✅ | `04-qualidade-resiliencia-observabilidade/` |
| 🔐 Segurança e DevSecOps | 0,7 | ✅ | `05-seguranca-devsecops/` |
| 🚀 Entrega Contínua | 0,7 | ✅ | `06-ci-cd/` |
| ⚡ Back-end Avançado | 4,0 | ✅ | `07-backend-avancado/` + código |
| 📸 Tech Forge - Multer | 4,0 | ✅ | `08-tech-forge-multer/` + código |
| **TOTAL** | **11,0** | **✅** | - |

---

## 🎯 Resumo Executivo

Este projeto implementa um sistema financeiro pessoal (Kash) com:

- ✅ **Arquitetura DDD** (Domain-Driven Design)
- ✅ **Bounded Contexts:** User e Financial
- ✅ **Cache Distribuído** com Redis (cache-aside, TTL)
- ✅ **Mensageria** com Redis Pub/Sub
- ✅ **Observabilidade** com Pino (logs JSON) e Prometheus (métricas)
- ✅ **Resiliência** com Circuit Breaker
- ✅ **Segurança** com JWT + RBAC
- ✅ **Upload de Arquivos** com Multer (validações completas)
- ✅ **Orquestração** com Docker Compose + Nginx
- ✅ **CI/CD** com GitHub Actions

**Tecnologias:**
- Backend: Node.js + TypeScript + Express
- Frontend: React Native (Expo)
- Banco: MySQL
- Cache: Redis
- Proxy: Nginx
- Container: Docker

---

## 📞 Suporte

Para dúvidas sobre a documentação ou implementação, consulte:
- Código-fonte em `backend/src/` e `frontend/app/`
- Scripts de teste em raiz do projeto (`testDockerNginx.ps1`)
- Logs da aplicação (veja `BOAS_PRATICAS_LOCALIZACAO.md`)

**Tech Academy 7** © 2025
