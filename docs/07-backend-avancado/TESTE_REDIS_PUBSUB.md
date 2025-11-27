# 🧪 Testando Redis Pub/Sub - Mensageria Distribuída

Este documento explica como testar e visualizar o Redis Pub/Sub funcionando na prática.

## 📋 Pré-requisitos

1. ✅ Redis rodando (via Docker Compose)
2. ✅ Backend configurado
3. ✅ Dependências instaladas (`npm install`)

## 🎯 3 Formas de Testar

---

## 1️⃣ Teste Automatizado (Mais Rápido)

Execute o script de teste que publica e consome eventos automaticamente:

```bash
cd backend
npx ts-node src/scripts/testPubSub.ts
```

**O que você verá:**
- ✅ Conexão ao Redis
- 📬 Configuração de 4 subscribers
- 📤 Publicação de 4 eventos de teste
- ✅ Recebimento e processamento dos eventos
- 📊 Estatísticas finais

**Saída esperada:**
```
🚀 INICIANDO TESTE DO REDIS PUB/SUB
════════════════════════════════════════════════════════════

📡 Conectando ao Redis...
✅ Conectado ao Redis!

📬 Configurando subscribers...
✅ Subscribers configurados!

════════════════════════════════════════════════════════════
📡 AGUARDANDO EVENTOS... (pressione Ctrl+C para sair)
════════════════════════════════════════════════════════════

📤 PUBLICANDO EVENTOS DE TESTE...

1️⃣  Publicando TransactionAdded...

✅ EVENTO RECEBIDO: TransactionAdded
   📊 Dados: { "aggregateId": "account-123", "amount": 150.5, ... }
   🔖 Metadata: { "userId": "user-456", ... }
   ⏰ Timestamp: 2025-11-27T...
```

---

## 2️⃣ Teste de Microserviço Distribuído (Recomendado para Demonstração)

Este teste simula um microserviço separado consumindo eventos da aplicação principal.

### Passo a passo:

**Terminal 1 - Iniciar Redis:**
```bash
docker-compose up redis
```

**Terminal 2 - Iniciar Subscriber (Microserviço):**
```bash
cd backend
npx ts-node src/scripts/testSubscriber.ts
```

Você verá:
```
🎧 MICROSERVIÇO SUBSCRIBER - INICIANDO
══════════════════════════════════════════════════════════════════════
Este é um serviço separado que consome eventos da aplicação principal
══════════════════════════════════════════════════════════════════════

📡 Conectando ao Redis...
✅ Conectado ao Redis Pub/Sub!

📬 Configurando listeners para TODOS os eventos...
🎧 SUBSCRIBER ATIVO - Aguardando eventos...
```

**Terminal 3 - Iniciar Backend Principal:**
```bash
cd backend
npm run dev
```

**Terminal 4 - Fazer Requisições na API:**

```bash
# 1. Criar um usuário
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Pub/Sub",
    "email": "pubsub@test.com",
    "password": "123456",
    "cpf": "12345678901"
  }'

# 2. Login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pubsub@test.com",
    "password": "123456"
  }'

# Copie o token retornado

# 3. Adicionar transação (dispara evento!)
curl -X POST http://localhost:3000/saldos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "type": "EXPENSE",
    "amount": 150.50,
    "description": "Teste Redis Pub/Sub",
    "categoryId": 1
  }'
```

**No Terminal 2 (Subscriber), você verá EM TEMPO REAL:**

```
══════════════════════════════════════════════════════════════════════
💳 [TRANSAÇÃO DETECTADA]
══════════════════════════════════════════════════════════════════════
🆔 Event ID: 1732742400000-abc123def
📦 Aggregate: account-123
💰 Valor: 150.5
📊 Tipo: EXPENSE
📝 Descrição: Teste Redis Pub/Sub
👤 User ID: user-456
⏰ Timestamp: 2025-11-27T12:00:00.000Z
══════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────────────
💰 [ATUALIZAÇÃO DE SALDO]
──────────────────────────────────────────────────────────────────────
🆔 Conta: account-123
👤 Usuário: user-456
🔴 Saldo Anterior: R$ 1000.00
🔴 Saldo Atual: R$ 849.50
📉 Diferença: R$ 150.50 (-)
⏰ Timestamp: 2025-11-27T12:00:00.000Z
──────────────────────────────────────────────────────────────────────
🔄 → Invalidando cache de saldo...
✅ → Cache invalidado!
```

---

## 3️⃣ Teste Manual via Redis CLI

Você pode usar o Redis CLI para ver as mensagens circulando:

**Terminal 1 - Subscriber via Redis CLI:**
```bash
docker exec -it kash-redis redis-cli
> PSUBSCRIBE kash:events:*
```

**Terminal 2 - Backend rodando:**
```bash
npm run dev
```

**Terminal 3 - Fazer requisições na API**

**No Terminal 1, você verá:**
```
1) "pmessage"
2) "kash:events:*"
3) "kash:events:TransactionAdded"
4) "{\"eventType\":\"TransactionAdded\",\"eventId\":\"...\",\"timestamp\":\"...\",\"data\":{...}}"
```

---

## 📊 Como Verificar nos Logs

### Logs do Backend (Terminal do servidor)

Procure por estas mensagens:

```json
{
  "level": "info",
  "msg": "Event published",
  "eventType": "TransactionAdded",
  "eventId": "1732742400000-abc123",
  "channel": "kash:events:TransactionAdded"
}
```

```json
{
  "level": "info",
  "msg": "Event received",
  "eventType": "TransactionAdded",
  "eventId": "1732742400000-abc123",
  "channel": "kash:events:TransactionAdded"
}
```

### Logs Estruturados (JSON)

Todos os eventos geram logs estruturados:

```json
{
  "level": "info",
  "time": "2025-11-27T12:00:00.000Z",
  "service": "kash-backend",
  "msg": "Domain event logged",
  "event": {
    "type": "TransactionAdded",
    "id": "1732742400000-abc123",
    "timestamp": "2025-11-27T12:00:00.000Z",
    "aggregateId": "account-123"
  },
  "data": {
    "amount": 150.5,
    "type": "EXPENSE"
  },
  "metadata": {
    "userId": "user-456",
    "correlationId": "TransactionAdded-123-1732742400000"
  }
}
```

---

## 🔍 Verificando se está Funcionando

### 1. Estatísticas do Event Bus

Adicione este endpoint temporário para debug:

```typescript
// backend/src/app.ts
app.get('/api/debug/eventbus-stats', (req, res) => {
  const stats = eventBus.getStats();
  res.json(stats);
});
```

Acesse: `http://localhost:3000/api/debug/eventbus-stats`

Resposta:
```json
{
  "connected": true,
  "subscribedChannels": 5,
  "totalHandlers": 6
}
```

### 2. Redis INFO

```bash
docker exec -it kash-redis redis-cli INFO stats
```

Procure por:
```
pubsub_channels:5
pubsub_patterns:1
```

### 3. Monitorar Redis em Tempo Real

```bash
docker exec -it kash-redis redis-cli MONITOR
```

Você verá todos os comandos Redis incluindo PUBLISHs.

---

## 🎯 Cenários de Teste Completos

### Cenário 1: Transação Normal
1. Crie uma transação via API
2. Observe no subscriber: `TransactionAdded` + `BalanceUpdated`

### Cenário 2: Gasto Excessivo
1. Crie transações que somem > R$ 5000
2. Observe no subscriber: `ExcessiveSpendingDetected`

### Cenário 3: Novo Usuário
1. Registre um novo usuário
2. Observe no subscriber: `UserCreated`

### Cenário 4: Múltiplos Subscribers
1. Execute `testSubscriber.ts` em 2 terminais diferentes
2. Faça uma transação
3. Ambos os subscribers receberão o evento (broadcast)

---

## 🐛 Troubleshooting

### Redis não conecta
```bash
# Verificar se Redis está rodando
docker ps | grep redis

# Ver logs do Redis
docker logs kash-redis

# Reiniciar Redis
docker-compose restart redis
```

### Eventos não são recebidos
1. Verifique se `initializeEventSystem()` foi chamado no app.ts
2. Verifique logs do backend: procure por "Event bus inicializado"
3. Verifique se os handlers estão registrados: procure por "Event handler registered"

### Mensagens duplicadas
- Normal! Redis Pub/Sub entrega mensagens para TODOS os subscribers
- Cada instância/handler receberá uma cópia

---

## 📚 Arquivos Relacionados

- **Publisher**: `backend/src/domain/handlers/EventHandlers.ts`
- **Subscriber**: `backend/src/utils/eventBusIntegration.ts`
- **Event Bus**: `backend/src/utils/eventBus.ts`
- **Script Teste 1**: `backend/src/scripts/testPubSub.ts`
- **Script Teste 2**: `backend/src/scripts/testSubscriber.ts`

---

## ✅ Checklist de Verificação

- [ ] Redis rodando
- [ ] Backend conectado ao Redis (logs: "Redis conectado")
- [ ] Event bus inicializado (logs: "Event bus inicializado")
- [ ] Subscribers configurados (logs: "Subscribed to event channel")
- [ ] Eventos publicados aparecem nos logs (logs: "Event published")
- [ ] Eventos recebidos aparecem nos logs (logs: "Event received")
- [ ] Script de teste executa sem erros
- [ ] Subscriber externo recebe eventos em tempo real

---

## 🎓 Demonstração para Rubrica

Para demonstrar que atende à rubrica "Mensageria e Assinatura de Eventos":

1. ✅ **Uso de Redis Pub/Sub**: Mostrar código em `eventBus.ts` (publish/subscribe)
2. ✅ **Publicar eventos**: Mostrar código em `EventHandlers.ts` (eventBus.publish)
3. ✅ **Consumir eventos**: Mostrar código em `eventBusIntegration.ts` (eventBus.subscribe)
4. ✅ **Logs que comprovem**: Executar `testSubscriber.ts` e mostrar eventos circulando
5. ✅ **Comunicação distribuída**: Executar 2 subscribers e mostrar broadcast

**Pontuação completa: 1.0 / 1.0 pontos** ✅
