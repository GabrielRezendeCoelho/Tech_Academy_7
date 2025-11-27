# C4 Model - Component Diagram (Backend API)

**Data:** 2025-11-20  
**Versão:** 1.0  
**Autor:** Tech Academy 7 Team

---

## 1. Visão Geral

Este documento descreve o **Diagrama de Componentes (nível 3)** do container **Backend API** do sistema Kash, detalhando os principais componentes internos, suas responsabilidades e interações.

---

## 2. Componentes do Backend API

### 2.1 Controllers Layer (Camada de Apresentação)

#### **UserController**
- **Responsabilidade:** Gerenciar endpoints relacionados a usuários
- **Endpoints:**
  - `POST /users` - Criar usuário
  - `POST /users/login` - Autenticação
  - `GET /users/me` - Obter perfil do usuário logado
  - `PUT /users/:id` - Atualizar usuário (admin only)
  - `DELETE /users/:id` - Deletar usuário (admin only)
- **Dependências:** UserModel, JWT Service, Authentication Middleware

#### **CategoriaController**
- **Responsabilidade:** CRUD de categorias de transações
- **Endpoints:**
  - `GET /categorias` - Listar categorias
  - `POST /categorias` - Criar categoria (requer autenticação)
  - `PUT /categorias/:id` - Atualizar categoria
  - `DELETE /categorias/:id` - Deletar categoria
- **Dependências:** CategoriaModel, Cache Middleware

#### **SaldoController**
- **Responsabilidade:** Gerenciar saldos e transações financeiras
- **Endpoints:**
  - `GET /saldos` - Listar saldos (com cache)
  - `GET /saldos/me` - Obter saldo do usuário logado
  - `POST /saldos` - Criar transação (invalida cache)
  - `PUT /saldos/:id` - Atualizar transação
  - `DELETE /saldos/:id` - Deletar transação
- **Dependências:** SaldoModel, CacheManager, EventBus

#### **UploadController**
- **Responsabilidade:** Upload e gerenciamento de imagens
- **Endpoints:**
  - `POST /api/upload/image` - Upload de imagem única
  - `POST /api/upload/images` - Upload múltiplo (max 5)
  - `DELETE /api/upload/:filename` - Deletar imagem
  - `GET /api/upload/:filename` - Obter informações da imagem
- **Dependências:** Multer Middleware, File System

---

### 2.2 Domain Layer (Camada de Domínio - DDD)

#### **Financial Bounded Context**
- **FinancialAccount (Aggregate Root)**
  - Entidade raiz que gerencia saldo e transações
  - Métodos: `addTransaction()`, `getBalance()`, `validateTransaction()`
  
- **Transaction (Entity)**
  - Representa uma transação financeira
  - Propriedades: valor, data, categoria, origem
  
- **Money (Value Object)**
  - Encapsula valor monetário com validações
  - Garante imutabilidade e regras de negócio
  
- **Category (Entity)**
  - Categorização de transações
  - Propriedades: nome, tipo (receita/despesa)

- **FinancialService (Domain Service)**
  - Orquestra operações complexas entre agregados
  - Métodos: `createTransaction()`, `calculateBalance()`, `detectExcessiveSpending()`

#### **User Bounded Context**
- **User (Aggregate Root)**
  - Gerencia dados e autenticação do usuário
  - Propriedades: name, email, password (hash), role (admin/user), cpf
  
- **Email (Value Object)**
  - Validação de formato de e-mail
  - Garante unicidade

---

### 2.3 Infrastructure Layer (Camada de Infraestrutura)

#### **CacheManager**
- **Responsabilidade:** Implementação do padrão Cache-Aside com Redis
- **Funcionalidades:**
  - `get<T>(key)` - Busca com desserialização JSON
  - `set(key, value, ttl)` - Armazena com TTL (padrão 300s)
  - `invalidate(key)` - Invalida chave única
  - `invalidatePattern(pattern)` - Invalidação em massa (ex: `http:*`)
  - `wrap(key, fn, ttl)` - Cache-aside automático
- **Tecnologia:** Redis client v4.7.1
- **Namespace:** `kash:*`

#### **EventBus**
- **Responsabilidade:** Mensageria distribuída com Redis Pub/Sub
- **Eventos Suportados:**
  - `TransactionAdded` - Publicado após criar transação
  - `ExcessiveSpendingDetected` - Alerta de gastos excessivos
  - `BalanceUpdated` - Saldo atualizado
  - `UserCreated` - Novo usuário registrado
- **Funcionalidades:**
  - `publish(event)` - Publica evento com metadata
  - `subscribe(eventType, handler)` - Inscreve handler
  - `subscribePattern(pattern, handler)` - Pattern matching (ex: `Transaction*`)
- **Tecnologia:** Redis Pub/Sub com 2 clientes separados

#### **Database (Sequelize ORM)**
- **Responsabilidade:** Abstração de acesso a dados
- **Models:**
  - UserModel (users table)
  - CategoriaModel (categorias table)
  - SaldoModel (saldos/transactions table)
- **Configuração:** MySQL 8.0 na porta 3307
- **Features:** Auto-sync, migrations, validations

#### **CircuitBreaker**
- **Responsabilidade:** Resiliência em chamadas externas
- **Padrão:** Circuit Breaker com biblioteca Opossum
- **Configuração:**
  - Timeout: 3000ms (DB), 5000ms (External)
  - ErrorThreshold: 50%
  - ResetTimeout: 30s (DB), 60s (External)
- **Uso:** Protege chamadas ao banco e serviços externos

---

### 2.4 Middleware Layer

#### **Authentication Middleware**
- **Responsabilidade:** Validar JWT token
- **Funcionamento:**
  - Extrai token do header `Authorization: Bearer <token>`
  - Verifica assinatura e expiração
  - Injeta `req.user` com dados do usuário
- **Tecnologia:** jsonwebtoken

#### **Authorization Middleware**
- **Responsabilidade:** Controle de acesso baseado em roles (RBAC)
- **Roles:** `admin`, `user`
- **Uso:** `requireRole('admin')` protege rotas administrativas

#### **Cache Middleware**
- **Responsabilidade:** Cache automático de responses HTTP
- **Funcionalidades:**
  - `cacheMiddleware(options)` - Cacheia GET requests
  - `invalidateCacheMiddleware(patterns)` - Invalida após mutações (POST/PUT/DELETE)
  - Adiciona headers: `X-Cache: MISS/HIT`, `X-Cache-Key`
- **Estratégia:** Cache-Aside com TTL de 300s

#### **Upload Middleware (Multer)**
- **Responsabilidade:** Upload seguro de imagens
- **Validações:**
  - Extensões permitidas: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
  - MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
  - Tamanho máximo: 5MB por arquivo
  - Limite: 10 arquivos por request
- **Storage:** Disk com estrutura `uploads/YYYY/MM/DD/`
- **Naming:** `{uuid}-{timestamp}-{originalname}.ext` (anti-colisão)

#### **Error Handler Middleware**
- **Responsabilidade:** Tratamento centralizado de erros
- **Funcionalidades:**
  - Captura exceções de toda a aplicação
  - Formata respostas de erro padronizadas
  - Log estruturado com Pino
  - Oculta stack traces em produção

---

## 3. Fluxo de Dados Principais

### 3.1 Autenticação (Login)
```
Client → POST /users/login
  → UserController.login()
    → UserModel.findByEmail()
    → bcrypt.compare(password, hash)
    → JWT.sign({ id, email, role })
  ← Response: { token, user }
```

### 3.2 Consulta de Saldo (com Cache)
```
Client → GET /saldos (Bearer token)
  → Authentication Middleware (valida JWT)
  → Cache Middleware
    → CacheManager.get('kash:http:GET:/saldos')
    → [MISS] → SaldoController.listSaldos()
      → SaldoModel.findAll({ where: { userId } })
      → CacheManager.set('kash:http:GET:/saldos', data, 300)
    ← Response: { data } + X-Cache: MISS
  
Client → GET /saldos (segunda chamada)
  → Cache Middleware
    → CacheManager.get('kash:http:GET:/saldos')
    → [HIT] → Return cached data
    ← Response: { data } + X-Cache: HIT
```

### 3.3 Criar Transação (com Event Publishing)
```
Client → POST /saldos (Bearer token + JSON body)
  → Authentication Middleware
  → Invalidate Cache Middleware (registra invalidação pós-resposta)
  → SaldoController.createSaldo()
    → Validate input (valor, userId, categoriaId)
    → SaldoModel.create({ valor, userId, categoriaId, data, origem })
    → EventBus.publish({
         type: 'TransactionAdded',
         aggregateId: newSaldo.id,
         userId: req.user.id,
         data: { valor, categoriaId }
       })
    → Response: { id, valor, userId, ... }
  → [Após resposta] CacheManager.invalidatePattern('kash:http:*')
  ← Response: 201 Created

[Em paralelo]
EventBus Subscriber (TransactionAdded)
  → CacheManager.invalidatePattern('saldos:*')
  → Logger.info('Transaction added event processed')
```

### 3.4 Upload de Imagem
```
Client → POST /api/upload/image (multipart/form-data)
  → Authentication Middleware
  → Multer Middleware
    → Validate extension (.jpg, .png, etc)
    → Validate MIME type (image/jpeg, image/png, etc)
    → Validate size (max 5MB)
    → Generate unique filename: {uuid}-{timestamp}-{basename}.ext
    → Save to disk: uploads/2025/11/20/{filename}
  → UploadController.uploadSingleImage()
    → Format response: { filename, url, size, mimetype }
  ← Response: 201 Created { filename, url: '/uploads/2025/11/20/...', size, mimetype }
```

---

## 4. Interações entre Componentes

### Cache + Database
```
CacheManager ↔ Redis (port 6379)
  - GET/SET operações com namespace 'kash:'
  - TTL automático (300s padrão)
  - Pattern matching para invalidação em massa

Controllers → CacheManager.wrap(key, () => DB.query())
  - Cache-Aside automático
  - Fallback para DB se cache falhar
```

### Event Bus + Domain Services
```
FinancialService.createTransaction()
  → EventBus.publish('TransactionAdded')
    → Redis Pub/Sub (canal: kash:events:TransactionAdded)
      → Subscriber 1: Cache invalidation
      → Subscriber 2: Logging/Audit
      → Subscriber 3: Excessive spending detection
```

### Circuit Breaker + Database
```
SaldoController.listSaldos()
  → CircuitBreaker.fire(() => SaldoModel.findAll())
    → [SUCCESS] → return data
    → [TIMEOUT/ERROR] → increment failure count
    → [50% errors] → OPEN circuit (fallback: cached data or error)
    → [After 30s] → HALF_OPEN (test 1 request)
    → [SUCCESS] → CLOSE circuit
```

---

## 5. Decisões de Design

### 5.1 Por que DDD no Domain Layer?
- **Separation of Concerns:** Domínio isolado de infraestrutura
- **Ubiquitous Language:** Entities/VOs refletem linguagem do negócio
- **Aggregate Roots:** FinancialAccount gerencia transações de forma consistente
- **Domain Events:** Comunicação entre bounded contexts via EventBus

### 5.2 Por que Cache-Aside Pattern?
- **Lazy Loading:** Cache populado sob demanda
- **Controle Fino:** Invalidação manual via patterns
- **Resiliência:** Aplicação funciona se cache falhar (fallback para DB)

### 5.3 Por que Redis Pub/Sub?
- **Desacoplamento:** Serviços não precisam conhecer subscribers
- **Escalabilidade:** Múltiplos subscribers podem processar eventos
- **Auditoria:** Pattern matching (`Transaction*`) captura todos eventos de transação

### 5.4 Por que Multer com Disk Storage?
- **Simplicidade:** Não requer cloud storage (S3, etc) para MVP
- **Validação:** Controle total sobre extensões, MIME, tamanho
- **Anti-colisão:** UUID + timestamp garante nomes únicos

---

## 6. Observabilidade

### Logs Estruturados (Pino)
```typescript
logger.info({ 
  cacheKey, 
  requestId, 
  userId, 
  duration: 45 
}, 'Cache HIT');
```

### Métricas (Prometheus)
- `kash_cache_hits_total` - Total de cache hits
- `kash_cache_misses_total` - Total de cache misses
- `kash_http_requests_total{method, path, status}` - Requests HTTP
- `kash_circuit_breaker_state{name}` - Estado do circuit breaker

### Health Checks
- `GET /health` → `{ status: 'ok', timestamp }`
- `GET /api/health` → Mesmo endpoint com prefixo `/api`

---

## 7. Diagrama ASCII

```
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   User       │  │  Categoria   │  │    Saldo     │          │
│  │  Controller  │  │  Controller  │  │  Controller  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                           │                                      │
│              ┌────────────▼────────────┐                        │
│              │  Middleware Layer       │                        │
│              │  - Auth (JWT)           │                        │
│              │  - Authorization (RBAC) │                        │
│              │  - Cache                │                        │
│              │  - Upload (Multer)      │                        │
│              └────────────┬────────────┘                        │
│                           │                                      │
│              ┌────────────▼────────────┐                        │
│              │   Domain Layer (DDD)    │                        │
│              │  ┌──────────────────┐   │                        │
│              │  │ Financial Context│   │                        │
│              │  │ - FinancialAccount│  │                        │
│              │  │ - Transaction     │  │                        │
│              │  │ - Money (VO)      │  │                        │
│              │  │ - Category        │  │                        │
│              │  └──────────────────┘   │                        │
│              │  ┌──────────────────┐   │                        │
│              │  │  User Context    │   │                        │
│              │  │ - User            │  │                        │
│              │  │ - Email (VO)      │  │                        │
│              │  └──────────────────┘   │                        │
│              └────────────┬────────────┘                        │
│                           │                                      │
│              ┌────────────▼────────────┐                        │
│              │ Infrastructure Layer    │                        │
│              │  - CacheManager         │                        │
│              │  - EventBus             │                        │
│              │  - Database (Sequelize) │                        │
│              │  - CircuitBreaker       │                        │
│              └─────────┬───┬───┬───────┘                        │
└────────────────────────┼───┼───┼──────────────────────────────┘
                         │   │   │
                    ┌────▼───▼───▼────┐
                    │  External Deps  │
                    │  - Redis (6379) │
                    │  - MySQL (3307) │
                    │  - File System  │
                    └─────────────────┘
```

---

## 8. Referências

- **C4 Model:** https://c4model.com/
- **DDD:** Domain-Driven Design by Eric Evans
- **Cache-Aside Pattern:** Microsoft Azure Architecture Patterns
- **Circuit Breaker:** Release It! by Michael T. Nygard
- **Redis Pub/Sub:** https://redis.io/docs/manual/pubsub/

---

**Última atualização:** 2025-11-20
