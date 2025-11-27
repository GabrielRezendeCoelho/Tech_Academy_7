```markdown
# Threat Model Básico

Data: 2025-11-04

Objetivo: identificar ativos, atores, pontos de entrada e ameaças principais (STRIDE) e propor mitigações práticas para o sistema.

## 1. Ativos
- Credenciais de usuários (senhas, tokens)
- Dados financeiros (transactions, saldos)
- Dados pessoais (email, nome)
- Chaves de infraestrutura / segredos (DB credentials, API keys)
- Imagens de contêiner e artefatos de build

## 2. Atores
- Usuário legítimo
- Ator malicioso externo
- Operador/Administrador (com acesso infra)
- Serviço terceiro (email provider, auth provider)

## 3. Pontos de entrada
- Endpoints HTTP(S) públicos (REST API)
- Interfaces de autenticação (login)
- Pipeline CI/CD (acesso a repositório, secrets)
- Banco de dados (porta de rede)
- Dependências de terceiros (npm packages)

## 4. Análise STRIDE (resumo)

- Spoofing (falsificação de identidade)
  - Risco: médio
  - Ex.: credenciais comprometidas; tokens roubados
  - Mitigações: hashing de senhas (bcrypt), MFA opcional, rotação de tokens, proteção contra brute-force (rate-limiting), monitoramento de login incomum.

- Tampering (violação/integridade)
  - Risco: alto
  - Ex.: injeção SQL, manipulação de payloads
  - Mitigações: usar ORM com queries parametrizadas (Sequelize), validação de entrada, prepared statements, tests de segurança.

- Repudiation (repúdio)
  - Risco: médio
  - Ex.: usuário nega ter feito transação
  - Mitigações: logs imutáveis com timestamps, requestId, auditoria, assinaturas quando aplicável.

- Information Disclosure (vazamento)
  - Risco: alto
  - Ex.: logs com dados sensíveis, exposição de endpoints
  - Mitigações: redaction de dados sensíveis, criptografia em trânsito (TLS) e em repouso (se necessário), políticas de retenção, revisão de logs.

- Denial of Service (DoS)
  - Risco: médio
  - Ex.: request flood em endpoints críticos
  - Mitigações: rate-limiting, circuit-breakers, autoscaling, WAF/proxy.

- Elevation of Privilege
  - Risco: alto
  - Ex.: vulnerabilidade que permite execução de operações administrativas
  - Mitigações: princípio de privilégio mínimo, separação de ambientes (dev/staging/prod), revisão de permissões e políticas RBAC.

## 5. Mitigações práticas e recomendações

1. Segurança de dependências: SCA (Snyk/Trivy) na pipeline, bloqueio de versões vulneráveis.
2. Secrets: não guardar segredos no repo; usar GitHub Secrets / Vault; verificação periódica e rotação.
3. Hardening de imagens: não executar como root, reduzir camadas e componentes desnecessários.
4. Proteção da API: autenticação forte, rate limits, validação de entrada, CORS configurado com restrições.
5. Logging e auditoria: logs estruturados, requestId, retenção e controle de acesso a logs.
6. Backup & Recovery: rotinas de backup automatizadas e testes periódicos de restore.
7. Pipeline seguro: access controls no repositório, revisão de PR obrigatória, verificações de segurança como gates.

## 6. Prioridade de mitigação (curto prazo)

- 1: Secrets e SCA no pipeline (alta prioridade)
- 2: Validations & ORM sanitization (alta)
- 3: Rate-limiting e proteção contra brute force (média)
- 4: Logging e requestId (média)

---
Esse é um threat model inicial. Recomenda-se revisar a cada release major ou após mudanças arquiteturais.
```
