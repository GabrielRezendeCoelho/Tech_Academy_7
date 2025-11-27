# 📋 Boas Práticas e Observabilidade - Localização no Projeto

## 🏗️ 1. Organização do Código

### **Estrutura Modular (DDD - Domain-Driven Design)**

```
backend/src/
├── domain/                          # Camada de Domínio (regras de negócio)
│   ├── financial/
│   │   ├── Category.ts             # Entidade: Categoria
│   │   ├── FinancialAccount.ts     # Aggregate Root: Conta Financeira
│   │   ├── Money.ts                # Value Object: Dinheiro
│   │   ├── Transaction.ts          # Entidade: Transação
│   │   ├── services/
│   │   │   └── FinancialService.ts # Serviço de Domínio
│   │   └── repositories/
│   │       └── IFinancialAccountRepository.ts  # Interface do Repositório
│   ├── user/
│   │   ├── User.ts                 # Aggregate Root: Usuário
│   │   └── Email.ts                # Value Object: Email
│   ├── shared/                     # Objetos compartilhados
│   │   ├── Entity.ts               # Classe base para Entidades
│   │   ├── ValueObject.ts          # Classe base para Value Objects
│   │   └── AggregateRoot.ts        # Classe base para Aggregate Roots
│   └── handlers/
│       └── EventHandlers.ts        # Handlers de eventos de domínio
│
├── controllers/                     # Camada de Aplicação
│   ├── userController.ts           # Controller de Usuários
│   ├── categoriaController.ts      # Controller de Categorias
│   ├── saldoController.ts          # Controller de Saldo
│   └── saldoControllerEnhanced.ts  # Controller Enhanced com logs
│
├── repositories/                    # Implementações de Repositórios
│   └── FinancialAccountRepository.ts
│
├── models/                          # Modelos Sequelize (Infraestrutura)
│   ├── userModel.ts
│   ├── saldoModel.ts
│   └── categoriaModel.ts
│
├── routes/                          # Rotas HTTP
│   ├── userRoutes.ts
│   ├── categoriaRoutes.ts
│   └── saldoRoutes.ts
│
├── middleware/                      # Middlewares
│   ├── auth.ts                     # Autenticação e Autorização
│   ├── authMiddleware.ts           # Middlewares de Auth (JWT, roles)
│   ├── uploadMiddleware.ts         # Upload de arquivos (Multer)
│   ├── authorization.ts            # Controle de acesso
│   └── metrics.ts                  # Métricas Prometheus
│
├── utils/                           # Utilitários
│   ├── logger.ts                   # ⭐ Sistema de Logs (Pino)
│   ├── cacheManager.ts             # Gerenciador de Cache Redis
│   ├── eventBus.ts                 # Event Bus (Pub/Sub)
│   ├── circuitBreaker.ts           # Circuit Breaker para resiliência
│   └── eventBusIntegration.ts      # Integração de eventos
│
└── config/                          # Configurações
    ├── database.ts                 # Configuração do Sequelize
    └── redis.ts                    # Configuração do Redis
```

---

## 📊 2. Logs Claros para Identificar Fluxos

### **Sistema de Logging Estruturado (Pino)**

**Localização:** `backend/src/utils/logger.ts`

#### **Características:**
- ✅ **Logs em formato JSON** (estruturado e parseável)
- ✅ **Request ID único** em todas as requisições
- ✅ **Diferentes níveis**: debug, info, warn, error
- ✅ **Metadata contextual** (userId, requestId, duration, etc)
- ✅ **Timestamp ISO 8601**
- ✅ **Environment e service tags**

#### **Exemplos de Uso:**

**1. Request/Response Logging Automático**
```typescript
// backend/src/utils/logger.ts - Linha 20
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random()}`;
  
  (req as any).logger.info({
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }, 'Incoming request');
  
  // Log de resposta com duração
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    (req as any).logger.info({
      status: res.statusCode,
      duration_ms: duration,
    }, 'Request completed');
  };
}
```

**2. Logs de Domínio (Eventos de Negócio)**
```typescript
// backend/src/domain/handlers/EventHandlers.ts
export const handleTransactionAdded = (event: DomainEvent) => {
  logger.info({
    type: event.type,
    transactionType: event.transactionType,
    amount: event.amount,
    newBalance: event.newBalance
  }, '💸 Transaction added to account');
};
```

**3. Logs de Cache**
```typescript
// backend/src/utils/cacheManager.ts
logger.debug({ key: fullKey }, 'Cache HIT');     // Linha 92
logger.debug({ key: fullKey }, 'Cache MISS');    // Linha 96
logger.debug({ key: fullKey, ttl }, 'Cache SET'); // Linha 119
```

**4. Logs de Autenticação**
```typescript
// backend/src/middleware/auth.ts
logger.warn({ path: req.path, requestId }, 'Authentication failed: No token'); // Linha 25
logger.info({ userId: req.user.id, requestId }, 'User authenticated');         // Linha 39
logger.warn({ userId, requestId }, 'Authorization denied');                     // Linha 56
```

**5. Logs de Circuit Breaker (Resiliência)**
```typescript
// backend/src/utils/circuitBreaker.ts
logger.error({ breakerName }, 'Circuit breaker OPENED - too many failures');    // Linha 25
logger.warn({ breakerName }, 'Circuit breaker HALF-OPEN - testing recovery');   // Linha 30
logger.info({ breakerName }, 'Circuit breaker CLOSED - service recovered');     // Linha 34
```

**6. Logs de Controllers com Context**
```typescript
// backend/src/controllers/saldoControllerEnhanced.ts
const logger = (req as any).logger; // Logger com requestId automático

logger.info({ userId }, 'Fetching user balance');                    // Linha 28
logger.info({ userId, source: 'cache' }, 'Balance from cache');     // Linha 39
logger.warn({ userId }, 'Financial account not found');              // Linha 53
logger.info({ userId, balance }, 'Balance fetched successfully');    // Linha 89
logger.error({ userId, error, requestId }, 'Error fetching balance'); // Linha 93
```

---

## 🛡️ 3. Tratamento de Erros

### **A. Middleware Global de Erros**

**Localização:** `backend/src/app.ts` (linhas 117-132)

```typescript
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    logger.warn({ requestId: (req as any).requestId, error: err.message }, 
      'Invalid JSON in request body');
    return res.status(400).json({ error: "JSON inválido no corpo da requisição." });
  }
  
  logger.error({ requestId: (req as any).requestId, error: err }, "Erro não tratado");
  return res.status(500).json({ error: "Erro interno do servidor." });
});
```

### **B. Try-Catch nos Controllers**

**Exemplo:** `backend/src/controllers/saldoControllerEnhanced.ts`

```typescript
export const getSaldo = async (req: Request, res: Response) => {
  const requestId = (req as any).requestId;
  const logger = (req as any).logger;
  
  try {
    // Lógica de negócio
    logger.info({ userId }, 'Fetching user balance');
    
    // ... código ...
    
    logger.info({ userId, balance }, 'Balance fetched successfully');
    res.json({ balance });
    
  } catch (error: any) {
    logger.error({ userId, error, requestId }, 'Error fetching balance');
    res.status(500).json({ 
      error: 'Erro ao buscar saldo', 
      requestId 
    });
  }
};
```

### **C. Tratamento de Erros no Multer (Upload)**

**Localização:** `backend/src/middleware/uploadMiddleware.ts` (linhas 46-75)

```typescript
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Arquivo muito grande. Tamanho máximo: 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Número de arquivos excedido. Envie apenas 1 arquivo.'
      });
    }
    // ... outros erros específicos do Multer
  }
  
  if (err) {
    return res.status(400).json({
      error: err.message || 'Erro ao processar upload'
    });
  }
  
  next();
};
```

### **D. Circuit Breaker para Resiliência**

**Localização:** `backend/src/utils/circuitBreaker.ts`

```typescript
// Protege contra falhas em cascata
export async function executeWithCircuitBreaker<T>(
  operation: () => Promise<T>,
  opts: CircuitBreakerOptions
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.warn({ breakerName: opts.name, error }, 'Circuit breaker - operation failed');
    throw error;
  }
}
```

### **E. Tratamento de Erros em Repositórios**

**Localização:** `backend/src/repositories/FinancialAccountRepository.ts`

```typescript
async findById(id: number): Promise<FinancialAccount | null> {
  try {
    const saldo = await Saldo.findByPk(id, { include: [{ model: Categoria }] });
    // ... lógica ...
  } catch (error) {
    logger.error({ id, error }, 'Error finding financial account by id');
    throw error;
  }
}
```

### **F. Validação de Entrada com Mensagens Claras**

**Localização:** `backend/src/controllers/userController.ts`

```typescript
export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    // ... lógica ...
    
  } catch (error) {
    console.error('❌ Erro ao fazer upload da foto:', error);
    res.status(500).json({ 
      error: 'Erro ao fazer upload da foto', 
      details: error 
    });
  }
};
```

---

## 📈 4. Métricas e Observabilidade

### **Prometheus Metrics**

**Localização:** `backend/src/middleware/metrics.ts`

```typescript
// Métricas disponíveis:
- http_requests_total (contador de requisições)
- http_request_duration_seconds (histograma de duração)
- http_requests_in_progress (gauge de requisições ativas)

// Endpoint: GET /metrics
```

### **Health Checks**

**Localização:** `backend/src/app.ts`

```typescript
// Endpoint: GET /health
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Endpoint: GET /api/health (para load balancers)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
```

---

## 🎯 5. Padrões e Arquitetura

### **A. Domain-Driven Design (DDD)**

- **Aggregate Roots**: `FinancialAccount`, `User`
- **Entities**: `Transaction`, `Category`
- **Value Objects**: `Money`, `Email`
- **Domain Services**: `FinancialService`
- **Repositories**: Interface + Implementação separadas
- **Domain Events**: Eventos de negócio com handlers

### **B. Separação de Camadas**

1. **Domain** (backend/src/domain/) - Regras de negócio puras
2. **Application** (backend/src/controllers/) - Casos de uso
3. **Infrastructure** (backend/src/models/, config/) - Persistência e serviços externos
4. **Presentation** (backend/src/routes/) - API HTTP

### **C. Dependency Injection**

**Exemplo:** Repository Pattern com DI

```typescript
// Interface (contrato)
export interface IFinancialAccountRepository {
  findById(id: number): Promise<FinancialAccount | null>;
  save(account: FinancialAccount): Promise<void>;
}

// Implementação concreta
export class FinancialAccountRepository implements IFinancialAccountRepository {
  // Implementação usando Sequelize
}
```

---

## 📝 6. Documentação de Arquitetura

### **Architecture Decision Records (ADRs)**

**Localização:** `backend/docs/adr/`

- `0001-choose-database.md` - Decisão sobre banco de dados
- `0002-authentication-and-authorization.md` - Sistema de auth
- `0003-observability-and-logging.md` - Estratégia de logs

### **Documentação de Infraestrutura**

**Localização:** `backend/docs/infraestrutura/`

- `01-atributos-qualidade.md` - Atributos de qualidade (disponibilidade, performance, etc)
- `02-slos-slis.md` - SLOs e SLIs definidos
- `03-estrategias-resiliencia.md` - Circuit breaker, retry, timeout
- `04-plano-observabilidade.md` - Estratégia de monitoramento

### **Diagramas C4**

**Localização:** `docs/arquitetura/`

- `01-c4-context-and-containers.md` - Diagramas de contexto e containers

---

## 🔍 7. Como Encontrar os Logs

### **Durante Desenvolvimento:**

```bash
# Backend com logs coloridos
cd backend
npm run dev

# Logs aparecem no terminal:
{"level":"info","time":"2025-11-27T...","service":"kash-backend","method":"GET","path":"/users/me","msg":"Incoming request"}
{"level":"info","time":"2025-11-27T...","userId":5,"msg":"Balance fetched successfully"}
```

### **Logs de Eventos de Domínio:**

Procure por ícones/emojis nos logs:
- 💸 Transaction added
- ⚠️ Alert published
- 💰 Balance update
- 👤 User created
- ✅ Event published to Redis

### **Filtrando Logs:**

```bash
# Ver apenas erros
npm run dev | grep '"level":"error"'

# Ver logs de um requestId específico
npm run dev | grep 'req_1234567890'

# Ver logs de cache
npm run dev | grep 'Cache'
```

---

## ✅ Checklist de Boas Práticas Implementadas

- ✅ **Organização modular** (DDD, camadas separadas)
- ✅ **DTOs implícitos** (interfaces TypeScript para validação)
- ✅ **Services** (FinancialService, domain services)
- ✅ **Controllers** bem estruturados com responsabilidade única
- ✅ **Logs estruturados** (JSON com Pino)
- ✅ **Request ID** em todas as requisições
- ✅ **Logs contextuais** (userId, requestId, duration, etc)
- ✅ **Diferentes níveis** de log (debug, info, warn, error)
- ✅ **Try-catch** em todos os controllers
- ✅ **Middleware global** de erros
- ✅ **Validações** com mensagens claras
- ✅ **Circuit Breaker** para resiliência
- ✅ **Métricas Prometheus** (/metrics)
- ✅ **Health checks** (/health)
- ✅ **Domain Events** com handlers
- ✅ **Repository Pattern**
- ✅ **Value Objects** para validação de negócio
- ✅ **ADRs** documentando decisões arquiteturais

---

## 🚀 Resumo Executivo

| Aspecto | Localização Principal | Status |
|---------|----------------------|--------|
| **Logs Estruturados** | `backend/src/utils/logger.ts` | ✅ Implementado |
| **Tratamento de Erros** | Todos os controllers + `app.ts` (middleware global) | ✅ Implementado |
| **Organização (DDD)** | `backend/src/domain/` | ✅ Implementado |
| **Separação de Camadas** | domain/, controllers/, models/, routes/ | ✅ Implementado |
| **Métricas** | `backend/src/middleware/metrics.ts` | ✅ Implementado |
| **Resiliência** | `backend/src/utils/circuitBreaker.ts` | ✅ Implementado |
| **Documentação** | `backend/docs/` e `docs/` | ✅ Implementado |

**Tudo está pronto e funcionando! 🎉**
