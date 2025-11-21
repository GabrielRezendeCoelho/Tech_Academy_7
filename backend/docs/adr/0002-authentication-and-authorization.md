```markdown
# ADR 0002 — Autenticação e Autorização

Data: 2025-11-04  
Status: **Aceito** (Implementado em 2025-11-20)

## Contexto

O sistema precisa controlar acesso a recursos sensíveis (consultar e alterar saldos, criar transações, gerenciar categorias). Deve haver um mecanismo simples, seguro e compatível com a arquitetura atual (Node.js backend + Frontend móvel/web).

## Decisão

Adotar autenticação baseada em JWT (JSON Web Tokens) com tokens de acesso de curta duração e refresh tokens. Autorização será baseada em roles simples (user, admin) e verificações de ownership em endpoints (ex.: usuário só modifica seus próprios lançamentos).

## Justificativa

- Simplicidade de implementação no backend Node.js e compatibilidade com clientes móveis/web.
- Desempenho: JWT evita lookup de sessão em cada requisição (desde que revogação seja tratada quando necessária).
- Flexibilidade: possiblidade de integrar futuramente com provedores externos (OAuth2 / OpenID Connect).

## Alternativas consideradas

1. Sessions server-side (cookies)
   - Mais controle sobre revogação, porém exige armazenamento de sessão e complexidade para mobile.

2. OAuth2 / OpenID Connect (provedor externo)
   - Recomendado para integrações SSO; overhead inicial maior.

3. API Keys
   - Não adequado para autenticação de usuários finais.

## Consequências

- Implementar refresh tokens seguros (armazenamento e rotação).
- Implementar blacklist/revogação de tokens quando necessário (ex.: logout imediato ou comprometimento).
- Reforçar proteção contra CSRF quando aplicar cookies; com JWT em Authorization header o risco é menor.

## Implementação / follow-ups

✅ **IMPLEMENTADO (2025-11-20):**
1. ✅ Endpoint POST /users/login -> retorna { accessToken (JWT), user }
2. ✅ Middleware de autenticação implementado (valida JWT em Authorization: Bearer <token>)
3. ✅ User model com campos: id, name, email, password (bcrypt hash), cpf, role (enum: 'user', 'admin')
4. ✅ JWT configurado com algoritmo HS256, expiração de 1h, secret em .env (JWT_SECRET)
5. ✅ Endpoint POST /users para registro com hash bcrypt (rounds=10)

🔄 **PENDENTE:**
1. Implementar middleware de autorização por roles (requireRole('admin'))
2. Implementar refresh tokens com rotação segura
3. Store de refresh tokens no Redis para revogação
4. Adicionar endpoint POST /auth/logout para blacklist de tokens
5. Migrar HS256 para RS256 (public/private keys) para ambiente distribuído

## Status Atual (2025-11-20)

- ✅ Autenticação JWT funcionando (login, registro, validação de token)
- ✅ Hash de senhas com bcrypt implementado
- ✅ Campo `role` adicionado ao User model (padrão: 'user')
- ⚠️ Autorização por roles **não implementada** (middleware requireRole falta)
- ⚠️ Refresh tokens **não implementados**
- ⚠️ Logout/revogação de tokens **não implementado**

## Referências
- RFC7519 - JSON Web Token
- OWASP Authentication Cheat Sheet

```
