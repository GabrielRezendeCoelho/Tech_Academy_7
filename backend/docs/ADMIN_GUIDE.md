# Guia de Administração - Sistema de Controle de Acesso

## Visão Geral

Este sistema implementa **RBAC (Role-Based Access Control)** com dois níveis de permissão:
- **user** (usuário comum) - Acesso limitado aos próprios recursos
- **admin** (administrador) - Acesso completo ao sistema

## 🔐 Autenticação e Autorização

### JWT Token
Todos os tokens JWT incluem os campos:
```json
{
  "id": 123,
  "email": "usuario@email.com",
  "role": "user" // ou "admin"
}
```

### Headers de Requisição
```http
Authorization: Bearer <seu-token-jwt>
```

## 📋 Endpoints Públicos (Sem Autenticação)

### 1. Criar Usuário Comum
```http
POST /users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "cpf": "12345678900"
}
```

**Resposta:**
```json
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login
```http
POST /users/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "user"
  }
}
```

### 3. Reset de Senha
```http
POST /users/reset-password
Content-Type: application/json

{
  "email": "joao@email.com"
}
```

## 👤 Endpoints de Usuário (Autenticado)

Requerem token JWT válido, qualquer role.

### 1. Atualizar Próprio Perfil
```http
PUT /users/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "João Silva Updated",
  "email": "novoemail@email.com",
  "cpf": "12345678900"
}
```

### 2. Atualizar Próprio Email
```http
PUT /users/update-email
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "novoemail@email.com"
}
```

### 3. Atualizar Própria Senha
```http
PUT /users/update-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "senhaAtual": "senha123",
  "novaSenha": "novaSenha456"
}
```

### 4. Deletar Própria Conta
```http
DELETE /users/delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "senha": "senha123"
}
```

## 🔍 Endpoints Admin ou Owner

### 1. Ver Perfil de Usuário
```http
GET /users/:id
Authorization: Bearer <token>
```

**Regra:**
- ✅ Admin pode ver qualquer usuário
- ✅ User pode ver apenas próprio perfil (seu ID)
- ❌ User não pode ver perfil de outros

## 👑 Endpoints Apenas Admin

### 1. Listar Todos os Usuários
```http
GET /users
Authorization: Bearer <admin-token>
```

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "user"
  },
  {
    "id": 2,
    "name": "Admin User",
    "email": "admin@email.com",
    "role": "admin"
  }
]
```

### 2. Criar Usuário Admin
```http
POST /users/admin
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Novo Admin",
  "email": "admin@email.com",
  "password": "senhaAdmin123",
  "cpf": "98765432100"
}
```

**Resposta:**
```json
{
  "message": "Admin criado com sucesso",
  "user": {
    "id": 2,
    "name": "Novo Admin",
    "email": "admin@email.com",
    "role": "admin"
  }
}
```

### 3. Atualizar Qualquer Usuário
```http
PUT /users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Nome Atualizado",
  "email": "email@atualizado.com",
  "cpf": "12345678900",
  "role": "admin"  // Opcional: pode mudar role
}
```

### 4. Deletar Qualquer Usuário
```http
DELETE /users/:id
Authorization: Bearer <admin-token>
```

**Resposta:**
```json
{
  "message": "Usuário deletado com sucesso"
}
```

### 5. Promover Usuário para Admin
```http
PATCH /users/:id/promote
Authorization: Bearer <admin-token>
```

**Resposta:**
```json
{
  "message": "Usuário promovido a admin com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "admin"
  }
}
```

### 6. Rebaixar Admin para Usuário Comum
```http
PATCH /users/:id/demote
Authorization: Bearer <admin-token>
```

**Resposta:**
```json
{
  "message": "Admin rebaixado para usuário comum",
  "user": {
    "id": 2,
    "name": "Ex Admin",
    "email": "exadmin@email.com",
    "role": "user"
  }
}
```

## 🚨 Códigos de Erro

| Código | Significado |
|--------|-------------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token não fornecido ou inválido |
| 403 | Forbidden - Permissão insuficiente |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro no servidor |

### Exemplos de Respostas de Erro

**Token não fornecido:**
```json
{
  "error": "Token não fornecido"
}
```

**Token inválido:**
```json
{
  "error": "Token inválido ou expirado"
}
```

**Acesso negado (user tentando acessar rota admin):**
```json
{
  "error": "Acesso negado: permissão insuficiente"
}
```

**Ownership violation (user tentando acessar recurso de outro):**
```json
{
  "error": "Acesso negado: você só pode acessar seus próprios recursos"
}
```

## 🔧 Como Criar o Primeiro Admin

### Opção 1: Diretamente no Banco de Dados (Desenvolvimento)
```sql
-- Após criar um usuário normal, promova-o manualmente
UPDATE users SET role = 'admin' WHERE email = 'admin@email.com';
```

### Opção 2: Via API com Token Admin Existente
```bash
# Use o endpoint POST /users/admin com token de um admin já existente
curl -X POST http://localhost:3000/users/admin \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Admin",
    "email": "admin@email.com",
    "password": "senha123",
    "cpf": "98765432100"
  }'
```

### Opção 3: Script de Seed (Recomendado para Produção)
Crie um script `backend/src/scripts/createAdminUser.ts`:

```typescript
import bcrypt from 'bcrypt';
import { User } from '../models/userModel';
import sequelize from '../config/database';

async function createAdminUser() {
  await sequelize.sync();
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@sistema.com',
    password: hashedPassword,
    cpf: '00000000000',
    role: 'admin'
  });

  console.log('Admin criado:', admin.toJSON());
  process.exit(0);
}

createAdminUser();
```

Execute:
```bash
npx ts-node src/scripts/createAdminUser.ts
```

## 📊 Matriz de Permissões

| Endpoint | Público | User | Admin |
|----------|---------|------|-------|
| POST /users | ✅ | ✅ | ✅ |
| POST /users/login | ✅ | ✅ | ✅ |
| POST /users/reset-password | ✅ | ✅ | ✅ |
| PUT /users/update | ❌ | ✅ (próprio) | ✅ (próprio) |
| PUT /users/update-email | ❌ | ✅ (próprio) | ✅ (próprio) |
| PUT /users/update-password | ❌ | ✅ (próprio) | ✅ (próprio) |
| DELETE /users/delete | ❌ | ✅ (próprio) | ✅ (próprio) |
| GET /users | ❌ | ❌ | ✅ |
| GET /users/:id | ❌ | ✅ (próprio ID) | ✅ (qualquer) |
| POST /users/admin | ❌ | ❌ | ✅ |
| PUT /users/:id | ❌ | ❌ | ✅ |
| DELETE /users/:id | ❌ | ❌ | ✅ |
| PATCH /users/:id/promote | ❌ | ❌ | ✅ |
| PATCH /users/:id/demote | ❌ | ❌ | ✅ |

## 🧪 Testando o Sistema

### 1. Criar usuário comum
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Teste",
    "email": "user@test.com",
    "password": "senha123",
    "cpf": "12345678900"
  }'
```

### 2. Login como usuário comum
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "senha": "senha123"
  }'
# Guarde o token retornado
```

### 3. Tentar acessar rota admin (deve falhar)
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <user-token>"
# Esperado: 403 Forbidden
```

### 4. Promover usuário para admin (via DB)
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@test.com';
```

### 5. Login novamente como admin
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "senha": "senha123"
  }'
# Novo token com role: 'admin'
```

### 6. Acessar rota admin (deve funcionar)
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <admin-token>"
# Esperado: 200 OK com lista de usuários
```

## 🔒 Boas Práticas de Segurança

1. **Tokens JWT:**
   - Expiration: 1 hora (padrão)
   - Use HTTPS em produção
   - Armazene tokens de forma segura (nunca em localStorage - use httpOnly cookies)

2. **Senhas:**
   - Bcrypt com 10 rounds (implementado)
   - Força mínima de senha (recomendado adicionar validação)
   - Nunca retorne senhas em respostas

3. **Admin:**
   - Crie apenas admins necessários
   - Use auditoria para ações administrativas
   - Implemente 2FA para contas admin (recomendado)

4. **Logs:**
   - Todas as ações são logadas com `logger`
   - Inclui `userId`, `requestId`, `path`
   - Monitore tentativas de acesso não autorizado

## 📝 Próximas Implementações Recomendadas

- [ ] Refresh tokens
- [ ] Rate limiting por role (admin tem limite maior)
- [ ] Auditoria de ações administrativas em tabela separada
- [ ] 2FA para contas admin
- [ ] Validação de força de senha
- [ ] Bloqueio de conta após N tentativas falhas
- [ ] Soft delete para usuários (manter histórico)
- [ ] Permissões granulares (além de user/admin)
