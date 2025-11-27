# Atributos de Qualidade — API Tech Academy

Este documento reúne os atributos de qualidade (non-functional requirements) que norteiam o projeto: disponibilidade, confiabilidade, desempenho, segurança, manutenibilidade, observabilidade e escalabilidade.

## 1. Disponibilidade

- Objetivo: o serviço HTTP deve estar disponível para requisições válidas.
- Métricas relacionadas: uptime, tempo até primeiro byte (TTFB), taxa de erros 5xx.
- Expectativa operacional: alta disponibilidade para endpoints críticos (health, login, saldos).

## 2. Confiabilidade / Resiliência

- Objetivo: o sistema deve continuar funcionando mesmo sob falhas parciais (DB down, terceiros indisponíveis).
- Estratégias: retries com backoff, circuit breakers, bulkheads, timeouts, graceful degradation.

## 3. Desempenho

- Objetivo: respostas em tempo aceitável para o usuário final.
- Métricas: latency p50/p95/p99, throughput (req/s).
- Targets indicativos: p95 < 500ms para endpoints de leitura; p95 < 1s para escrita (ajustáveis conforme carga).

## 4. Segurança

- Objetivo: proteger dados sensíveis (senhas, tokens, PII)
- Requisitos: hash de senha (bcrypt), transporte via TLS, validação de inputs, políticas CORS restritivas em produção.
- Autenticação: JWT para endpoints protegidos; rotação de chaves e expiração curta do token (1h).

## 5. Manutenibilidade / Observabilidade

- Objetivo: desenvolvedores devem conseguir diagnosticar problemas rapidamente.
- Requisitos: logs estruturados, traces distribuídos, métricas instrumentadas, dashboards e runbooks.

## 6. Escalabilidade

- Objetivo: suportar crescimento de tráfego horizontalmente (replicar instâncias stateless e escalar DB separadamente).
- Estratégias: arquitetura stateless para API, usar filas para trabalho assíncrono e caching para leituras intensivas.

## 7. Testabilidade

- Objetivo: permitir testes automatizados (unit, integration, e2e) e testes de carga.
- Requisitos: ambientes de CI com banco de dados isolado (docker-compose), mocks para integrações externas.

---

Última revisão: 2025-10-31
