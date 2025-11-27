# Plano de Observabilidade — Tech Academy API

Este plano descreve como instrumentar a aplicação para logs, métricas e traces (três pilares da observabilidade), além de dashboards, alertas e retenção de dados.

## Objetivos

- Permitir diagnóstico rápido de falhas (MTTR baixo).
- Medir SLIs/SLOs definidos em `02-slos-slis.md`.
- Rastrear requisições e mapear causas raiz com traces distribuídos.

## Instrumentação recomendada

### 1) Logs

- Formato: logs estruturados (JSON) com campos: `timestamp`, `level`, `service`, `env`, `requestId`, `traceId`, `userId`, `path`, `method`, `status`, `duration_ms`, `message`, `error`.
- Local: escrever em stdout (container-friendly); stack de agregação central (e.g., Loki, ELK, Datadog).
- Níveis: DEBUG (dev), INFO (operacional), WARN, ERROR.
- Correlação: propagar `X-Request-Id` e `traceparent` (OpenTelemetry) entre serviços.

### 2) Métricas

- Exportar métricas em Prometheus format (endpoint /metrics protegido internamente).
- Métricas sugeridas:
  - `http_server_requests_total{method,path,status}`
  - `http_request_duration_seconds_bucket{method,path}`
  - `db_connection_errors_total`
  - `db_query_duration_seconds`
  - `job_queue_depth`
  - `cache_hit_ratio`
- Labels: `env`, `service`, `instance`, `path` (quando prático)

### 3) Tracing

- Usar OpenTelemetry para instrumentar transações críticas (login, criação de saldo, queries complexas).
- Exportar para Jaeger/Tempo/OTLP collector.
- Garantir amostragem sensata (p.ex. 1% global + 100% de traces que apresentam erro ou latência alta).

## Dashboards e Alertas

- Dashboards mínimos (Grafana):
  - Overview (uptime, error rate, request rate, p95 latency)
  - DB health (connections, slow queries, replication lag)
  - Auth/login health
  - Queue & background jobs
- Alertas mínimos:
  - Availability SLO breach → Pager
  - Error rate > threshold (ex.: > 1% por 10m) → Pager
  - Latency p95 > SLO por 10m → Alert to on-call
  - DB connection failures > 0.1% por 5m → Alert
  - High queue depth (jobs backlog) → Ops/Dev

## Retenção e custos

- Logs: retenção primária (hot) 7-30 dias, arquivamento em object storage (S3/Blob) por 90-365 dias conforme compliance.
- Métricas: retenção de alta resolução (1s/10s) por 7 dias; downsample para 1m por 30-90 dias.
- Traces: retenção curta (7-30 dias) com amostragem para reduzir custo.

## Runbook / Playbooks

- Incluir runbook para os principais alertas (SLO breach, DB down, erro em login).
- Cada runbook deve conter: passos de diagnóstico, comandos comuns (logs/metrics/traces), mitigação temporária e próximos passos.

## Instrumentação prática (exemplo mínimo)

- Libraries:
  - Metrics: prom-client (Node.js)
  - Tracing: @opentelemetry/api, @opentelemetry/sdk-node
  - Logs: pino ou winston com saída JSON
- Expor `/metrics` e `/health` endpoints; integrar collector local/OTLP.

## Observability-first mindset

- Instrumentar durante o desenvolvimento (não só em produção).
- Reforçar que cada PR crítico inclua métricas/traces/ logs necessários para diagnosticar a mudança.

---

Última revisão: 2025-10-31
