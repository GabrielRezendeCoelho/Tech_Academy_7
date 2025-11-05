```markdown
# ADR 0002 — Autenticação e Autorização

Data: 2025-11-04
Status: Proposto

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

1. Endpoint POST /auth/login -> retorna { accessToken, refreshToken }
2. Middleware de autenticação que valida JWT no header Authorization: Bearer <token>
3. Middleware de autorização por roles e verificação de ownership (ex.: middleware ensureOwner)
4. Store de refresh tokens (posição segura) e política de rotação. Pode usar Redis para tokens revogados.
5. Regras de segurança: algoritmo de assinatura robusto (RS256 preferível a HS256 para ambientes distribuídos), expirações configuráveis (access: 10-60 minutos; refresh: 7-30 dias)

## Referências
- RFC7519 - JSON Web Token
- OWASP Authentication Cheat Sheet

```
