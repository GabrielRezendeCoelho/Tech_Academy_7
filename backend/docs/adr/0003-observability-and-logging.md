```markdown
# ADR 0003 — Observabilidade e Logging

Data: 2025-11-04  
Status: **Aceito** (Implementado em 2025-11-20)

## Contexto

Para operar o sistema com confiabilidade e detectar incidentes é necessário definir padrões de logging, métricas e tracing. A aplicação Node.js deve expor informações para monitoramento sem vazar dados sensíveis.

## Decisão

Adotar uma pilha básica de observabilidade:

- Logs estruturados em JSON (level, timestamp, requestId, userId, message)
- Métricas de aplicação expostas via Prometheus (endpoint /metrics)
- Tracing distribuído com OpenTelemetry (opcional inicialmente, incremental)

## Justificativa

- Logs estruturados facilitam ingestão por ELK/Logstash/Vector.
- Prometheus é leve e bem suportado em infra Kubernetes/VMs.
- OpenTelemetry prepara o terreno para tracing entre frontend/backend e integra com soluções SaaS (Jaeger/Tempo).

## Alternativas consideradas

1. Plataforma SaaS completa (Datadog, NewRelic)
   - Bom para curto prazo, porém custos e lock-in.

2. Logs apenas em arquivos
   - Não viável para operação escalável e análise de incidentes.

## Consequências

- Implementar logger (p.ex. Winston/Pino) e normalizar formato JSON.
- Adicionar requestId em middleware e propagar em logs para correlação.
- Configurar scraping do endpoint Prometheus nas infra de staging/prod.

## Implementação / follow-ups

✅ **IMPLEMENTADO (2025-11-20):**
1. ✅ Logger Pino instalado e configurado com saída JSON estruturada (src/utils/logger.ts)
2. ✅ Logs com campos: level, timestamp, requestId (quando disponível), userId, message, context
3. ✅ Endpoint GET /metrics exposto com métricas Prometheus:
   - `kash_http_requests_total{method, path, status}` - Total de requisições HTTP
   - `kash_cache_hits_total` - Total de cache hits
   - `kash_cache_misses_total` - Total de cache misses
   - `kash_circuit_breaker_state{name}` - Estado do circuit breaker (closed/open/half-open)
4. ✅ Logs estruturados em todos os componentes principais (controllers, services, middleware)
5. ✅ Health check endpoint GET /health → `{ status: 'ok', timestamp }`

🔄 **PENDENTE:**
1. Adicionar middleware de requestId (X-Request-Id) automático em todas as requests
2. Configurar Prometheus scraping em staging/prod (prometheus.yml)
3. Criar dashboards Grafana básicos (request rate, latency, error rate)
4. Implementar OpenTelemetry para tracing distribuído (opcional)
5. Adicionar métricas de banco de dados (db_query_duration, db_pool_size)

## Status Atual (2025-11-20)

- ✅ Logs estruturados JSON com Pino em toda aplicação
- ✅ Métricas Prometheus expostas em /metrics
- ✅ Health check funcionando
- ⚠️ RequestId middleware **não implementado** (manual por enquanto)
- ⚠️ Grafana dashboards **não criados**
- ⚠️ OpenTelemetry tracing **não implementado**

## Critérios de aceitação

- Logs estruturados presentes em todos os serviços principais.
- Métricas básicas visíveis no Prometheus/Grafana em staging.
- Tracing funcionando em fluxo crítico (login -> consulta saldo).

```
