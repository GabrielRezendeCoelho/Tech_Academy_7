# 📸 Sistema de Upload de Fotos de Perfil com Multer

## ✅ Implementação Completa

### 🎯 Recursos Implementados

#### 1. **Upload com Multer**
- ✅ Configuração completa do Multer para armazenamento em disco
- ✅ Geração de nomes únicos usando crypto (previne colisão)
- ✅ Armazenamento em `backend/uploads/profiles/`

#### 2. **Validações de Segurança**
- ✅ **Extensões permitidas**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- ✅ **MIME types validados**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- ✅ **Tamanho máximo**: 5MB por arquivo
- ✅ **Limite de arquivos**: 1 arquivo por vez

#### 3. **Sistema de Roles (Admin/User)**
- ✅ Middleware `authenticateToken` - verifica JWT
- ✅ Middleware `requireAdmin` - restringe acesso a admins
- ✅ Middleware `requireOwnerOrAdmin` - permite acesso ao próprio usuário ou admin
- ✅ Campo `role` no modelo User (`'user' | 'admin'`)

#### 4. **Gerenciamento de Fotos**
- ✅ Upload de foto (qualquer usuário autenticado)
- ✅ Deleção automática da foto antiga ao fazer novo upload
- ✅ Remoção manual de foto
- ✅ Admin pode visualizar foto de qualquer usuário

---

## 🚀 Rotas da API

### **Upload de Foto (Usuário Autenticado)**
```http
POST /users/photo
Authorization: Bearer {token}
Content-Type: multipart/form-data

Campo do formulário: "photo" (arquivo)
```

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/users/photo \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -F "photo=@caminho/para/sua/foto.jpg"
```

**Resposta de sucesso:**
```json
{
  "message": "Foto de perfil atualizada com sucesso",
  "photoUrl": "/uploads/profiles/a3f5b8c9d2e1f4...7a8b.jpg",
  "fileInfo": {
    "filename": "a3f5b8c9d2e1f4...7a8b.jpg",
    "size": 245678,
    "mimetype": "image/jpeg"
  }
}
```

---

### **Deletar Foto (Usuário Autenticado)**
```http
DELETE /users/photo
Authorization: Bearer {token}
```

**Exemplo com cURL:**
```bash
curl -X DELETE http://localhost:3000/users/photo \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

**Resposta:**
```json
{
  "message": "Foto de perfil deletada com sucesso"
}
```

---

### **Ver Foto de Usuário (Apenas Admin)**
```http
GET /users/:id/photo
Authorization: Bearer {token_admin}
```

**Exemplo:**
```bash
curl -X GET http://localhost:3000/users/5/photo \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

**Resposta:**
```json
{
  "photoUrl": "/uploads/profiles/a3f5b8c9d2e1f4...7a8b.jpg",
  "user": {
    "id": 5,
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

---

## 🔒 Validações Implementadas

### 1. **Validação de Extensão**
```typescript
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ext = path.extname(file.originalname).toLowerCase();
```

### 2. **Validação de MIME Type**
```typescript
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!allowedMimeTypes.includes(file.mimetype)) {
  // Rejeita o arquivo
}
```

### 3. **Validação de Tamanho**
```typescript
limits: {
  fileSize: 5 * 1024 * 1024, // 5MB máximo
}
```

### 4. **Prevenção de Colisão de Nomes**
```typescript
const uniqueSuffix = crypto.randomBytes(16).toString('hex');
const filename = `${uniqueSuffix}${ext}`;
// Resultado: "a3f5b8c9d2e1f4...7a8b.jpg"
```

---

## 🛡️ Mensagens de Erro

### Arquivo muito grande
```json
{
  "error": "Arquivo muito grande. Tamanho máximo: 5MB"
}
```

### Extensão inválida
```json
{
  "error": "Extensão de arquivo inválida. Permitidas: .jpg, .jpeg, .png, .gif, .webp"
}
```

### Número de arquivos excedido
```json
{
  "error": "Número de arquivos excedido. Envie apenas 1 arquivo."
}
```

### Campo de arquivo inesperado
```json
{
  "error": "Campo de arquivo inesperado. Use o campo 'photo'."
}
```

---

## 📁 Estrutura de Arquivos Criados

```
backend/
├── src/
│   ├── middleware/
│   │   ├── uploadMiddleware.ts      # Configuração Multer + validações
│   │   └── authMiddleware.ts        # JWT + roles (admin/user)
│   ├── controllers/
│   │   └── userController.ts        # +3 funções (upload, delete, get)
│   ├── routes/
│   │   └── userRoutes.ts            # Rotas /users/photo
│   ├── models/
│   │   └── userModel.ts             # +photoUrl column
│   └── types/
│       └── custom.d.ts              # Type extension Request.user
├── uploads/
│   └── profiles/                    # Fotos armazenadas aqui
└── database/
    └── init.sql/
        └── add_photo_column.sql     # Migration SQL
```

---

## 🧪 Testando com Postman/Insomnia

### 1. **Fazer Login**
```http
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```
➡️ Copie o `token` da resposta

### 2. **Upload de Foto**
- Método: `POST`
- URL: `http://localhost:3000/users/photo`
- Headers: `Authorization: Bearer {token}`
- Body: `form-data`
  - Key: `photo` (tipo: File)
  - Value: Selecione uma imagem

### 3. **Verificar Foto Salva**
- Acesse: `http://localhost:3000/uploads/profiles/{filename}`
- Ou faça GET na rota do usuário para ver `photoUrl`

---

## 🔐 Sistema de Roles

### Criar Admin (apenas outro admin pode fazer)
```http
POST /users/admin
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "senha123",
  "cpf": "12345678900"
}
```

### Promover Usuário a Admin
```http
PATCH /users/:id/promote
Authorization: Bearer {token_admin}
```

### Rebaixar Admin para User
```http
PATCH /users/:id/demote
Authorization: Bearer {token_admin}
```

---

## 📊 Modelo de Dados Atualizado

```typescript
class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public cpf!: string;
  public role!: 'user' | 'admin';      // ⭐ Role
  public photoUrl!: string | null;     // ⭐ Nova coluna
}
```

---

## 🎯 Checklist de Implementação

- ✅ Multer instalado e configurado
- ✅ Validação de extensão (.jpg, .jpeg, .png, .gif, .webp)
- ✅ Validação de MIME type
- ✅ Validação de tamanho máximo (5MB)
- ✅ Prevenção de colisão de nomes (crypto.randomBytes)
- ✅ Deleção automática de foto antiga
- ✅ Sistema de roles (admin/user)
- ✅ Middleware de autenticação (JWT)
- ✅ Middleware de autorização (requireAdmin, requireOwnerOrAdmin)
- ✅ Rotas protegidas com controle de acesso
- ✅ Tratamento de erros personalizado
- ✅ Logs de upload e deleção
- ✅ Coluna photoUrl no banco de dados
- ✅ Migration SQL criada

---

## 🚨 Importante para Produção

1. **Armazenamento**: Considere usar AWS S3, Cloudinary ou similar
2. **Segurança**: Implemente rate limiting para uploads
3. **Performance**: Use CDN para servir imagens
4. **Validação**: Considere adicionar scan de vírus
5. **Backup**: Configure backup automático do diretório uploads/

---

## 📝 Próximos Passos Opcionais

- [ ] Redimensionamento automático de imagens (sharp)
- [ ] Compressão de imagens
- [ ] Suporte a múltiplos formatos (WebP otimizado)
- [ ] Upload direto para cloud storage (S3/Cloudinary)
- [ ] Crop de imagem no frontend
- [ ] Validação de proporção (quadrada para perfil)

**Sistema de upload completo e funcional! 🎉**
