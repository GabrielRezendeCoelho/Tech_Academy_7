# 🚀 Tech Academy 7 - Guia Completo de Uso das Novas Features

## 📋 Índice

1. [Cache Distribuído Redis](#cache-distribuído-redis)
2. [Mensageria Redis Pub/Sub](#mensageria-redis-pubsub)
3. [Upload de Imagens com Multer](#upload-de-imagens-multer)
4. [Nginx Reverse Proxy](#nginx-reverse-proxy)
5. [Exemplos Práticos](#exemplos-práticos)

---

## 1. Cache Distribuído Redis

### 1.1 Cache Manager (Cache-Aside Pattern)

```typescript
import { cacheManager } from './utils/cacheManager';

// Conectar ao Redis
await cacheManager.connect('redis://localhost:6379');

// GET - Buscar do cache
const user = await cacheManager.get<User>('user:123');

// SET - Salvar no cache com TTL (5 minutos)
await cacheManager.set('user:123', userData, 300);

// DELETE - Invalidar cache específico
await cacheManager.invalidate('user:123');

// DELETE PATTERN - Invalidar múltiplas chaves
await cacheManager.invalidatePattern('user:*'); // Remove user:123, user:456, etc.

// WRAP - Cache automático (cache-aside)
const user = await cacheManager.wrap(
  'user:123',
  async () => await db.findUser(123),
  { ttl: 600 }
);
```

### 1.2 Cache Middleware (HTTP Response Caching)

```typescript
import { cacheMiddleware, invalidateCacheMiddleware } from './middleware/cache';

// Cache de GET requests (TTL 60s)
router.get('/api/saldo/:userId', 
  cacheMiddleware({ ttl: 60, keyPrefix: 'saldo' }), 
  getSaldoController
);

// Invalidar cache após mutações
router.post('/api/saldo', 
  invalidateCacheMiddleware(['saldo:*']), // Invalida todo cache de saldo
  createSaldoController
);

// Cache com query params
router.get('/api/transactions', 
  cacheMiddleware({ ttl: 300, includeQuery: true }), 
  getTransactionsController
);

// Pular cache condicionalmente
router.get('/api/data', 
  cacheMiddleware({ 
    ttl: 120,
    skipCache: (req) => req.headers['x-no-cache'] === 'true'
  }), 
  getDataController
);
```

### 1.3 Exemplo Completo - Controller com Cache

```typescript
// Controller com cache manual
export async function getSaldo(req: Request, res: Response) {
  const { userId } = req.params;
  const cacheKey = `saldo:user:${userId}`;

  // 1. Tenta buscar do cache
  const cached = await cacheManager.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // 2. Cache miss - busca do banco
  const saldo = await dbCircuitBreaker.fire(async () => {
    return await SaldoModel.findByUserId(userId);
  });

  // 3. Salva no cache (TTL 5 min)
  await cacheManager.set(cacheKey, saldo, 300);

  res.json(saldo);
}

// Controller com invalidação após update
export async function updateSaldo(req: Request, res: Response) {
  const { userId } = req.params;

  // 1. Atualiza banco
  const updated = await SaldoModel.update(userId, req.body);

  // 2. Invalida cache
  await cacheManager.invalidate(`saldo:user:${userId}`);
  await cacheManager.invalidatePattern('saldo:list:*'); // Invalida listas

  res.json(updated);
}
```

---

## 2. Mensageria Redis Pub/Sub

### 2.1 Event Bus - Publisher/Subscriber

```typescript
import { eventBus } from './utils/eventBus';

// Conectar ao Redis Pub/Sub
await eventBus.connect('redis://localhost:6379');

// PUBLISH - Publicar evento
await eventBus.publish('transaction.created', {
  userId: 123,
  amount: 100,
  type: 'expense'
}, {
  correlationId: 'req-123',
  userId: '123'
});

// SUBSCRIBE - Inscrever em evento
await eventBus.subscribe('transaction.created', async (event) => {
  console.log('Transaction received:', event);
  // Processar evento...
});

// PATTERN SUBSCRIBE - Inscrever em múltiplos eventos
await eventBus.subscribePattern('transaction.*', async (event) => {
  console.log('Transaction event:', event.eventType);
  // transaction.created, transaction.updated, etc.
});

// UNSUBSCRIBE - Remover inscrição
await eventBus.unsubscribe('transaction.created');

// Stats
const stats = eventBus.getStats();
console.log(stats); // { connected: true, subscribedChannels: 3, totalHandlers: 5 }
```

### 2.2 Integração com Domain Events

```typescript
import { initializeEventSystem } from './utils/eventBusIntegration';

// Inicializar sistema completo (no app.ts)
await initializeEventSystem(process.env.REDIS_URL);

// Agora domain events são automaticamente publicados no Redis!
// Exemplo: quando FinancialAccount dispara evento...
account.addTransaction(transaction); // Dispara TransactionAdded

// O evento é:
// 1. Processado localmente (DomainEventDispatcher)
// 2. Publicado no Redis (eventBus)
// 3. Recebido por outros serviços/instâncias
```

### 2.3 Exemplo Completo - Event-Driven Architecture

```typescript
// Service que publica eventos
export class TransactionService {
  async createTransaction(data: any) {
    // 1. Cria transação no banco
    const transaction = await TransactionModel.create(data);

    // 2. Publica evento no event bus
    await eventBus.publish('transaction.created', {
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      category: transaction.category
    }, {
      correlationId: data.requestId,
      source: 'transaction-service'
    });

    return transaction;
  }
}

// Service que consome eventos (pode ser outro microserviço!)
export class NotificationService {
  async initialize() {
    // Inscreve em eventos de transação
    await eventBus.subscribe('transaction.created', async (event) => {
      // Envia notificação push
      await this.sendPushNotification(event.data.userId, {
        title: 'Nova transação',
        body: `Gasto de R$ ${event.data.amount}`
      });

      // Invalida cache de notificações
      await cacheManager.invalidate(`notifications:user:${event.data.userId}`);
    });

    // Inscreve em gastos excessivos
    await eventBus.subscribe('excessive.spending.detected', async (event) => {
      // Envia alerta crítico
      await this.sendAlert(event.data.userId, 'Gasto excessivo!');
    });
  }
}
```

---

## 3. Upload de Imagens com Multer

### 3.1 Configuração

```typescript
import { uploadMiddleware, UPLOAD_CONFIG } from './middleware/upload';

// Configuração padrão
console.log(UPLOAD_CONFIG);
// {
//   maxFileSize: 5MB,
//   allowedImageExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
//   allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
//   uploadDir: './uploads',
//   useS3: false
// }
```

### 3.2 Routes com Upload

```typescript
import uploadRoutes from './routes/uploadRoutes';

// Registrar rotas
app.use('/api/upload', uploadRoutes);
```

### 3.3 Exemplos de Requests

#### Upload de Imagem Única

```bash
# POST /api/upload/image
curl -X POST http://localhost:3000/api/upload/image \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "image=@/path/to/photo.jpg"

# Response:
{
  "success": true,
  "message": "Imagem enviada com sucesso",
  "file": {
    "filename": "a1b2c3d4-1731600000-photo.jpg",
    "originalname": "photo.jpg",
    "mimetype": "image/jpeg",
    "size": 245678,
    "url": "http://localhost:3000/uploads/2025/11/14/a1b2c3d4-1731600000-photo.jpg",
    "path": "uploads/2025/11/14/a1b2c3d4-1731600000-photo.jpg"
  }
}
```

#### Upload de Múltiplas Imagens

```bash
# POST /api/upload/images (máximo 5)
curl -X POST http://localhost:3000/api/upload/images \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "images=@/path/to/photo1.jpg" \
  -F "images=@/path/to/photo2.jpg" \
  -F "images=@/path/to/photo3.jpg"

# Response:
{
  "success": true,
  "message": "3 imagens enviadas com sucesso",
  "files": [
    { "filename": "...", "url": "...", "size": 245678 },
    { "filename": "...", "url": "...", "size": 189234 },
    { "filename": "...", "url": "...", "size": 302456 }
  ],
  "count": 3
}
```

#### Deletar Imagem

```bash
# DELETE /api/upload/:filename
curl -X DELETE http://localhost:3000/api/upload/a1b2c3d4-1731600000-photo.jpg \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Response:
{
  "success": true,
  "message": "Imagem deletada com sucesso"
}
```

### 3.4 Validações Automáticas

```typescript
// Multer valida automaticamente:
// ✅ Extensão (.jpg, .jpeg, .png, .gif, .webp)
// ✅ MIME type (image/jpeg, image/png, etc)
// ✅ Tamanho máximo (5MB por arquivo)
// ✅ Quantidade máxima (10 arquivos por request)

// Erros retornados:
// - Extensão inválida: "Extensão não permitida. Permitidas: .jpg, .jpeg, ..."
// - MIME type inválido: "Tipo de arquivo não permitido. Permitidos: image/jpeg, ..."
// - Arquivo muito grande: "Arquivo muito grande. Tamanho máximo: 5MB"
// - Muitos arquivos: "Muitos arquivos. Máximo: 10 arquivos por vez"
```

### 3.5 Prevenção de Colisão de Nomes

```typescript
// Nomes gerados automaticamente:
// Formato: {uuid}-{timestamp}-{original-basename}.{ext}
// Exemplo: a1b2c3d4-e5f6-7890-abcd-1234567890-1731600000-photo.jpg

// Organização por data:
// uploads/2025/11/14/a1b2c3d4-1731600000-photo.jpg
//         └─┬─┘ └┬┘ └┬┘
//          ano  mês dia

// Garantia: ZERO colisão devido a UUID + timestamp
```

### 3.6 Controller Customizado

```typescript
import { Request, Response } from 'express';
import { uploadMiddleware, formatFileInfo } from './middleware/upload';

export async function uploadProfilePicture(req: Request, res: Response) {
  const userId = (req as any).user.id;

  // Multer já processou o upload
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo não enviado' });
  }

  const fileInfo = formatFileInfo(req.file);

  // Salva URL da imagem no banco
  await UserModel.update(userId, {
    profilePicture: fileInfo.url
  });

  // Invalida cache do usuário
  await cacheManager.invalidate(`user:${userId}`);

  res.json({
    success: true,
    profilePicture: fileInfo.url
  });
}

// Rota
router.post('/profile/picture', 
  authenticateToken,
  uploadMiddleware.single('image'),
  uploadProfilePicture
);
```

---

## 4. Nginx Reverse Proxy

### 4.1 Arquitetura

```
Cliente → Nginx (porta 80/443)
           ├─→ /api/*      → Backend (porta 3000)
           ├─→ /uploads/*  → Backend (porta 3000)
           ├─→ /metrics    → Backend (porta 3000)
           └─→ /*          → Frontend (porta 19006)
```

### 4.2 Features Configuradas

- ✅ **Reverse Proxy** para backend e frontend
- ✅ **Load Balancing** (preparado para múltiplas instâncias)
- ✅ **Gzip Compression** (6x menor payload)
- ✅ **Rate Limiting** (10 req/s API, 5 req/min login)
- ✅ **Security Headers** (X-Frame-Options, CSP, etc)
- ✅ **SSL/TLS Ready** (descomentar em produção)
- ✅ **Health Checks** sem rate limit
- ✅ **Static File Caching** (uploads com cache 30 dias)

### 4.3 Acessando via Nginx

```bash
# Backend via Nginx (porta 80)
curl http://localhost/api/health

# Upload via Nginx
curl -X POST http://localhost/api/upload/image \
  -H "Authorization: Bearer <token>" \
  -F "image=@photo.jpg"

# Métricas via Nginx
curl http://localhost/metrics

# Frontend via Nginx
curl http://localhost/
```

### 4.4 Rate Limiting

```nginx
# API geral: 10 req/s (burst 20)
location /api/ {
  limit_req zone=api_limit burst=20 nodelay;
  # Se exceder: HTTP 429 Too Many Requests
}

# Login: 5 req/min (burst 5)
location /api/auth/ {
  limit_req zone=login_limit burst=5 nodelay;
  # Previne brute force
}
```

---

## 5. Exemplos Práticos

### 5.1 Sistema de Notificações com Eventos

```typescript
// 1. Service que dispara evento
export class TransactionService {
  async create(data: any) {
    const transaction = await Transaction.create(data);
    
    // Publica evento
    await eventBus.publish('transaction.created', {
      userId: data.userId,
      amount: data.amount,
      category: data.category
    });
    
    return transaction;
  }
}

// 2. Notification Service que consome
export class NotificationService {
  async init() {
    await eventBus.subscribe('transaction.created', async (event) => {
      // Invalida cache de notificações
      await cacheManager.invalidate(`notifications:${event.data.userId}`);
      
      // Envia push notification
      await this.sendPush(event.data.userId, {
        title: 'Nova transação',
        body: `${event.data.category}: R$ ${event.data.amount}`
      });
    });
  }
}
```

### 5.2 Perfil de Usuário com Cache e Upload

```typescript
// Controller de perfil
export class UserProfileController {
  // GET - com cache
  async getProfile(req: Request, res: Response) {
    const userId = (req as any).user.id;
    
    // Cache-aside pattern
    const cached = await cacheManager.wrap(
      `profile:${userId}`,
      async () => await User.findById(userId),
      { ttl: 600 } // 10 min
    );
    
    res.json(cached);
  }
  
  // POST - upload foto de perfil
  async uploadPhoto(req: Request, res: Response) {
    const userId = (req as any).user.id;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file' });
    }
    
    const fileInfo = formatFileInfo(req.file);
    
    // Atualiza banco
    await User.update(userId, { 
      profilePicture: fileInfo.url 
    });
    
    // Invalida cache
    await cacheManager.invalidate(`profile:${userId}`);
    
    // Publica evento
    await eventBus.publish('user.profile.updated', {
      userId,
      field: 'profilePicture',
      value: fileInfo.url
    });
    
    res.json({ 
      success: true, 
      profilePicture: fileInfo.url 
    });
  }
}

// Routes
router.get('/profile', 
  authenticateToken,
  cacheMiddleware({ ttl: 600 }),
  getProfile
);

router.post('/profile/photo', 
  authenticateToken,
  uploadMiddleware.single('photo'),
  uploadPhoto
);
```

### 5.3 Dashboard com Múltiplas Fontes de Dados

```typescript
export class DashboardController {
  async getData(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const cacheKey = `dashboard:${userId}`;
    
    // Tenta cache primeiro
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    // Cache miss - busca dados em paralelo
    const [saldo, transactions, categories, stats] = await Promise.all([
      dbCircuitBreaker.fire(() => Saldo.findByUser(userId)),
      dbCircuitBreaker.fire(() => Transaction.findRecent(userId, 10)),
      dbCircuitBreaker.fire(() => Category.findByUser(userId)),
      dbCircuitBreaker.fire(() => Stats.calculate(userId))
    ]);
    
    const dashboard = { saldo, transactions, categories, stats };
    
    // Salva no cache (5 min)
    await cacheManager.set(cacheKey, dashboard, 300);
    
    res.json(dashboard);
  }
}
```

---

## 🎯 Checklist de Uso

### Inicialização

```typescript
// app.ts
import { cacheManager } from './utils/cacheManager';
import { initializeEventSystem } from './utils/eventBusIntegration';
import uploadRoutes from './routes/uploadRoutes';

async function startServer() {
  // 1. Conecta cache
  await cacheManager.connect(process.env.REDIS_URL);
  
  // 2. Inicializa event bus
  await initializeEventSystem(process.env.REDIS_URL);
  
  // 3. Registra rotas de upload
  app.use('/api/upload', uploadRoutes);
  
  // 4. Serve arquivos estáticos
  app.use('/uploads', express.static('uploads'));
  
  // 5. Inicia servidor
  app.listen(3000);
}
```

### Testes

```bash
# 1. Inicia serviços
docker-compose up -d

# 2. Testa cache
curl http://localhost:3000/api/saldo/123
# Primeira chamada: MISS (Header: X-Cache: MISS)
# Segunda chamada: HIT (Header: X-Cache: HIT)

# 3. Testa upload
curl -X POST http://localhost:3000/api/upload/image \
  -H "Authorization: Bearer <token>" \
  -F "image=@test.jpg"

# 4. Verifica Nginx
curl http://localhost/api/health
curl http://localhost/metrics

# 5. Monitora eventos (logs)
npm run dev | npx pino-pretty
# Veja eventos sendo publicados/consumidos
```

---

## 📚 Referências

- **Cache**: `backend/src/utils/cacheManager.ts`
- **Cache Middleware**: `backend/src/middleware/cache.ts`
- **Event Bus**: `backend/src/utils/eventBus.ts`
- **Upload**: `backend/src/middleware/upload.ts`
- **Nginx**: `nginx/nginx.conf`
- **Docker**: `docker-compose.yml`

**Pronto para produção! 🚀**
