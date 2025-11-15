# 🚀 Quick Start Guide - Tech Academy 7

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Instalação

```bash
# Clone o repositório (se ainda não tiver)
git clone https://github.com/GabrielRezendeCoelho/Tech_Academy_7.git
cd Tech_Academy_7

# Instalar dependências do backend
cd backend
npm install

# Voltar para raiz
cd ..
```

### 2️⃣ Configuração

Crie o arquivo `.env` no diretório `backend`:

```env
NODE_ENV=development
LOG_LEVEL=info
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kash_db
DB_USER=kash_user
DB_PASSWORD=kash_password
REDIS_URL=redis://localhost:6379
JWT_SECRET=sua-chave-secreta
PORT=3000
```

### 3️⃣ Adicionar Campo Role no Banco

```sql
-- Conecte no MySQL e execute:
USE kash_db;
ALTER TABLE users ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user';

-- Criar um usuário admin para testes
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### 4️⃣ Executar com Docker (Recomendado)

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker logs -f kash-backend

# Acessar
# Backend: http://localhost:3000
# Frontend: http://localhost:8080
# MySQL: localhost:3306
# Redis: localhost:6379
```

### 5️⃣ Executar Localmente

```bash
# Terminal 1: MySQL
# (ou use Docker para MySQL)
docker run -d -p 3306:3306 --name mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=kash_db \
  -e MYSQL_USER=kash_user \
  -e MYSQL_PASSWORD=kash_password \
  mysql:8.0

# Terminal 2: Redis
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Terminal 3: Backend
cd backend
npm run dev | npx pino-pretty
```

---

## 🧪 Testar as Funcionalidades

### Health Check
```bash
curl http://localhost:3000/health
```

### Métricas Prometheus
```bash
curl http://localhost:3000/metrics
```

### Criar Usuário
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "cpf": "12345678900"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Salve o token retornado!

### Usar Token
```bash
# Substituir SEU_TOKEN pelo token recebido
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Buscar saldo
curl http://localhost:3000/saldos \
  -H "Authorization: Bearer $TOKEN"

# Adicionar transação
curl -X POST http://localhost:3000/saldos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 100.50,
    "tipo": "INCOME",
    "categoria": "Salário",
    "descricao": "Pagamento mensal"
  }'
```

---

## 📊 Verificar Logs Estruturados

```bash
# Com pino-pretty (logs bonitos)
cd backend
npm run dev | npx pino-pretty

# Você verá logs como:
# [2025-11-14 10:30:15] INFO (kash-backend): Incoming request
#   method: "GET"
#   path: "/saldos"
#   requestId: "req_1731582615_abc123"
#   userId: 1
```

---

## 📈 Verificar Métricas

```bash
# Ver todas as métricas
curl http://localhost:3000/metrics

# Filtrar métricas específicas
curl http://localhost:3000/metrics | grep kash_http_requests_total
curl http://localhost:3000/metrics | grep kash_http_request_duration
curl http://localhost:3000/metrics | grep kash_db_errors_total
curl http://localhost:3000/metrics | grep kash_cache_hits_total
```

---

## 🔐 Testar Autorização por Roles

### Como User Comum
```bash
# Login como user
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"123456"}'

# Tentar acessar rota de admin (deve FALHAR com 403)
curl http://localhost:3000/admin/statistics \
  -H "Authorization: Bearer $USER_TOKEN"
```

### Como Admin
```bash
# Login como admin
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Acessar rota de admin (deve FUNCIONAR)
curl http://localhost:3000/admin/statistics \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🛠️ Testar Circuit Breaker

### Simular Falha de Banco

```bash
# Parar MySQL
docker stop mysql

# Fazer requisições (circuit breaker vai abrir após algumas falhas)
for i in {1..10}; do
  curl http://localhost:3000/saldos \
    -H "Authorization: Bearer $TOKEN"
  echo "\nRequest $i"
  sleep 1
done

# Ver logs - você verá:
# "Circuit breaker OPENED - too many failures"
# "Circuit breaker - operation rejected (circuit is open)"

# Reiniciar MySQL
docker start mysql

# Após 30s, circuit breaker vai para HALF-OPEN e tenta recuperar
# Depois de algumas requisições bem-sucedidas, volta para CLOSED
```

---

## 🎯 Rotas Disponíveis

### Públicas (sem autenticação):
- `GET /health` - Health check
- `GET /metrics` - Métricas Prometheus
- `POST /users` - Criar usuário
- `POST /users/login` - Login

### Autenticadas (requer token):
- `GET /saldos` - Buscar saldo
- `POST /saldos` - Adicionar transação
- `PUT /users/:id` - Atualizar usuário (ownership)
- `DELETE /users/:id` - Deletar usuário (ownership)

### Apenas Admin:
- `GET /admin/statistics` - Estatísticas do sistema
- `GET /admin/users` - Listar todos usuários
- `DELETE /admin/users/:id` - Deletar qualquer usuário

---

## 📚 Arquivos de Documentação

1. **CHECKLIST_TECH_ACADEMY.md** - Checklist completo (antes/depois)
2. **IMPLEMENTACAO_COMPLETA.md** - Detalhes técnicos
3. **GUIA_DE_USO.md** - Guia de uso das features
4. **SUMMARY_IMPLEMENTATION.md** - Resumo executivo
5. **QUICK_START.md** - Este guia

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'pino'"
```bash
cd backend
npm install pino pino-pretty prom-client opossum
```

### Erro: "ECONNREFUSED" ao conectar MySQL
```bash
# Verificar se MySQL está rodando
docker ps | grep mysql

# Ou iniciar MySQL
docker-compose up -d mysql
```

### Erro: "Redis connection failed"
```bash
# Verificar se Redis está rodando
docker ps | grep redis

# Ou iniciar Redis
docker-compose up -d redis
```

### Logs não aparecem bonitos
```bash
# Instalar pino-pretty globalmente
npm install -g pino-pretty

# Rodar com pipe
npm run dev | pino-pretty
```

### Port 3000 já está em uso
```bash
# Windows PowerShell
npm run kill-port

# Ou manualmente
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 🚀 Comandos Úteis

```bash
# Ver logs em tempo real
docker logs -f kash-backend

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (limpar banco)
docker-compose down -v

# Rebuild e reiniciar
docker-compose up -d --build

# Ver status dos serviços
docker-compose ps

# Entrar no container do backend
docker exec -it kash-backend sh

# Ver métricas do backend
curl http://localhost:3000/metrics | grep kash
```

---

## 📊 Monitoramento (Opcional)

### Adicionar Prometheus + Grafana

Adicione ao `docker-compose.yml`:

```yaml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

Criar `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'kash-backend'
    static_configs:
      - targets: ['backend:3000']
```

Acessar:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

---

## ✅ Checklist de Verificação

Após instalação, verifique:

- [ ] Backend responde no http://localhost:3000/health
- [ ] Métricas disponíveis em http://localhost:3000/metrics
- [ ] MySQL rodando (docker ps | grep mysql)
- [ ] Redis rodando (docker ps | grep redis)
- [ ] Login funciona e retorna token
- [ ] Logs estruturados aparecem no terminal
- [ ] Autorização por roles funciona
- [ ] Cache Redis funciona

---

## 🎉 Pronto!

Seu ambiente está configurado e rodando com:
- ✅ Logs estruturados
- ✅ Métricas Prometheus
- ✅ Circuit Breaker
- ✅ Autorização por Roles
- ✅ Domain Events
- ✅ Repository Pattern
- ✅ Cache Redis

**Projeto 100% production-ready!** 🚀

---

**Dúvidas?** Consulte a documentação completa nos arquivos .md da raiz do projeto.
