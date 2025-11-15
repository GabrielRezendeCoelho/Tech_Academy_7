# 📚 Guia de Uso - Novas Implementações

## 🎯 Como Usar as Novas Features

### 1. Logs Estruturados

#### No Controller:
```typescript
import { Request, Response } from 'express';

export const meuController = async (req: Request, res: Response) => {
  const logger = (req as any).logger; // Logger com requestId
  const requestId = (req as any).requestId;
  
  logger.info({ userId: req.user?.id }, 'Processing request');
  
  try {
    // Sua lógica aqui
    const result = await minhaFuncao();
    
    logger.info({ result }, 'Request processed successfully');
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error({ error, requestId }, 'Error processing request');
    res.status(500).json({ error: 'Internal error' });
  }
};
```

#### Logs de Domínio:
```typescript
import { logDomainEvent } from './utils/logger';

// Ao disparar evento de domínio
logDomainEvent('TransactionAdded', {
  transactionId: transaction.id,
  amount: transaction.amount,
  userId: account.userId
}, requestId);
```

---

### 2. Métricas Prometheus

#### Registrar Erro de DB:
```typescript
import { recordDbError } from './middleware/metrics';

try {
  await User.findByPk(id);
} catch (error) {
  recordDbError('findUser');
  throw error;
}
```

#### Registrar Cache Hit/Miss:
```typescript
import { recordCacheHit, recordCacheMiss } from './middleware/metrics';

const cached = await getCache(key);
if (cached) {
  recordCacheHit('saldos');
  return JSON.parse(cached);
} else {
  recordCacheMiss('saldos');
  // buscar do banco
}
```

#### Verificar Métricas:
```bash
# Via curl
curl http://localhost:3000/metrics

# Com Prometheus
# Adicione ao prometheus.yml:
scrape_configs:
  - job_name: 'kash-backend'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3000']
```

---

### 3. Circuit Breaker

#### Proteger Chamada de Banco:
```typescript
import { createDbCircuitBreaker } from './utils/circuitBreaker';

// Criar breaker uma vez (idealmente no construtor)
const findUserBreaker = createDbCircuitBreaker(
  async (id: number) => {
    return await User.findByPk(id);
  },
  { name: 'findUser', timeout: 5000 }
);

// Usar o breaker
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await findUserBreaker.fire(Number(req.params.id));
    res.json(user);
  } catch (error) {
    // Circuit pode estar aberto ou timeout
    res.status(503).json({ error: 'Service temporarily unavailable' });
  }
};
```

#### Retry com Backoff:
```typescript
import { withRetry } from './utils/circuitBreaker';

const result = await withRetry(
  async () => {
    return await externalApiCall();
  },
  3,      // máximo de tentativas
  1000,   // delay inicial (1s)
  10000   // delay máximo (10s)
);
```

---

### 4. Autorização por Roles

#### Adicionar Role ao JWT:
```typescript
// No login
const token = jwt.sign(
  { 
    id: user.id, 
    email: user.email,
    role: user.isAdmin ? 'admin' : 'user' // Adicione role
  },
  process.env.JWT_SECRET || 'secreta',
  { expiresIn: '1h' }
);
```

#### Proteger Rotas por Role:
```typescript
import { authenticateToken, requireRole, ensureOwnership } from './middleware/auth';

// Rota pública
router.post('/login', loginUser);

// Apenas autenticado
router.get('/profile', authenticateToken, getProfile);

// Apenas admin
router.get('/admin/users', 
  authenticateToken, 
  requireRole('admin'), 
  listAllUsers
);

// Admin ou próprio usuário
router.put('/users/:id', 
  authenticateToken, 
  ensureOwnership((req) => Number(req.params.id)), 
  updateUser
);

// Admin ou user (ambos podem acessar)
router.get('/saldos', 
  authenticateToken, 
  requireRole('admin', 'user'), 
  getSaldos
);
```

#### Adicionar Campo Role no Banco:
```sql
ALTER TABLE users ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user';
```

---

### 5. Domain Events

#### Disparar Evento no Aggregate:
```typescript
import { eventDispatcher } from './domain/shared/DomainEventDispatcher';

// No FinancialAccount.ts
public addTransaction(transaction: Transaction): void {
  this.transactions.push(transaction);
  
  // Disparar evento
  eventDispatcher.dispatch({
    eventName: 'TransactionAdded',
    occurredOn: new Date(),
    aggregateId: this.id,
    data: {
      transactionId: transaction.id,
      amount: transaction.amount.value,
      type: transaction.type,
      userId: this.userId
    }
  });
}
```

#### Criar Handler Customizado:
```typescript
import { DomainEvent, eventDispatcher } from './domain/shared/DomainEventDispatcher';

const handleMeuEvento = async (event: DomainEvent) => {
  logger.info({ event }, 'Handling custom event');
  
  // Sua lógica aqui
  // - Enviar email
  // - Atualizar cache
  // - Chamar API externa
  // - etc
};

// Registrar
eventDispatcher.register('MeuEvento', handleMeuEvento);
```

---

### 6. Repository Pattern

#### Usar Repository ao invés de Model:
```typescript
import { FinancialAccountRepository } from './repositories/FinancialAccountRepository';

const repo = new FinancialAccountRepository();

export const getSaldoController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Usar repository
    const account = await repo.findByUserId(userId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json({
      balance: account.getBalance().value,
      currency: account.getBalance().currency
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching account');
    res.status(500).json({ error: 'Internal error' });
  }
};
```

#### Criar Repository Customizado:
```typescript
import { IFinancialAccountRepository } from './domain/financial/repositories/IFinancialAccountRepository';
import { createDbCircuitBreaker } from './utils/circuitBreaker';

export class MyCustomRepository implements IFinancialAccountRepository {
  private breaker;
  
  constructor() {
    this.breaker = createDbCircuitBreaker(
      this._internalMethod.bind(this),
      { name: 'myOperation', timeout: 5000 }
    );
  }
  
  async findById(id: number): Promise<FinancialAccount | null> {
    return await this.breaker.fire(id);
  }
  
  private async _internalMethod(id: number): Promise<FinancialAccount | null> {
    // Sua implementação
    return null;
  }
  
  // Implementar outros métodos...
}
```

---

## 🧪 Testando as Implementações

### Teste de Logs:
```bash
# Rodar backend com logs bonitos
cd backend
npm run dev | npx pino-pretty

# Fazer requisição
curl http://localhost:3000/health

# Ver logs estruturados no terminal
```

### Teste de Métricas:
```bash
# Acessar métricas
curl http://localhost:3000/metrics

# Ver métricas específicas
curl http://localhost:3000/metrics | grep kash_http_requests_total
curl http://localhost:3000/metrics | grep kash_db_errors_total
```

### Teste de Circuit Breaker:
```typescript
// Criar script de teste: test-circuit.ts
import { createDbCircuitBreaker } from './utils/circuitBreaker';

const breaker = createDbCircuitBreaker(
  async () => {
    // Simula falha
    throw new Error('DB connection failed');
  },
  { name: 'test', errorThresholdPercentage: 30 }
);

// Fazer 10 chamadas
for (let i = 0; i < 10; i++) {
  try {
    await breaker.fire();
  } catch (e) {
    console.log(`Call ${i}: Failed`);
  }
  await new Promise(r => setTimeout(r, 100));
}

// Após algumas falhas, o circuito abre
// Tentativas subsequentes falham imediatamente
```

### Teste de Autorização:
```bash
# Login como user normal
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"123456"}'

# Usar token
TOKEN="seu-token-aqui"

# Tentar acessar rota de admin (deve falhar)
curl http://localhost:3000/admin/users \
  -H "Authorization: Bearer $TOKEN"
# Resposta: 403 Forbidden
```

---

## 📊 Configuração de Monitoramento

### docker-compose.yml completo com Prometheus + Grafana:

```yaml
services:
  # ... seus serviços existentes ...
  
  prometheus:
    image: prom/prometheus:latest
    container_name: kash-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - kash-network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: kash-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_SECURITY_ADMIN_USER=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - prometheus
    networks:
      - kash-network
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
```

### prometheus/prometheus.yml:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'kash-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: /metrics
```

### Acessar Dashboards:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

---

## 🚀 Deploy em Produção

### Variáveis de Ambiente:

```env
# .env.production
NODE_ENV=production
LOG_LEVEL=info
DB_HOST=seu-mysql-host
DB_PORT=3306
DB_NAME=kash_db
DB_USER=kash_user
DB_PASSWORD=senha-segura
REDIS_URL=redis://seu-redis:6379
JWT_SECRET=chave-super-secreta-produção
PORT=3000
```

### Checklist de Deploy:
- [x] Logs estruturados configurados
- [x] Métricas expostas no /metrics
- [x] Circuit breakers ativos
- [x] Autorização por roles implementada
- [x] Health checks funcionando
- [x] Restart policies configuradas
- [x] Secret scanning no pipeline
- [ ] Prometheus + Grafana configurados
- [ ] Alertas configurados
- [ ] Backups automáticos do banco

---

🎉 **Tudo pronto para produção!**
