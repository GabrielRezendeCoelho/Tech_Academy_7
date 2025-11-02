# SLOs e SLIs — Tech Academy API

Este documento define Service Level Indicators (SLIs) e Service Level Objectives (SLOs) para os principais serviços/endpoints.

> Nota: valores abaixo são recomendações iniciais — ajuste com base em tráfego real e requisitos de negócio.

## SLIs (o que medir)

- Availability (disponibilidade): percentual de respostas 200/2xx sobre o total de requisições válidas.
- Error rate (taxa de erro): percentagem de respostas 5xx (ou 4xx críticas) sobre total de requisições.
- Latency (latência): p50, p95, p99 da duração da requisição (ms).
- Time to recovery (MTTR): tempo médio para recuperação após incidente.
- DB connection success rate: sucesso em abrir/usar pool de conexões com o banco.

## SLOs (metas)

- SLO 1 — Disponibilidade geral da API (todos endpoints críticos): 99.9% por mês (≈ máximo 43m30s downtime/mês).
- SLO 2 — Latência de leitura (GET /saldos, GET /categorias): p95 < 500 ms.
- SLO 3 — Latência de escrita (POST /saldos, POST /users): p95 < 1 s.
- SLO 4 — Taxa de erro: < 0.5% de 5xx por janela de 1h.
- SLO 5 — DB connection success rate: 99.9% por mês.
- SLO 6 — Auth availability (login): 99.95% (login é crítico para UX).

## Burn rate e alertas

- Warning (informacional): quando erro/latência ultrapassar 50% do SLO por 5 minutos.
- Alert (critical): quando erro/latência ultrapassar 100% do SLO por 5-10 minutos.
- Pager (incidente): burn rate > 14x do SLO por 5 minutos (seguir playbook de incident response).

## Como medir (instrumentação)

- Métricas expostas em formato Prometheus pelo processo (via client lib):
  - http_server_requests_total{method, path, status}
  - http_server_request_duration_seconds_bucket{method, path}
  - db_connection_errors_total
  - jwt_auth_failures_total
- Traces: instrumentar transações críticas com OpenTelemetry (traceId propagado em logs).
- Logs: logs estruturados com campo `level`, `timestamp`, `requestId`, `traceId`, `duration_ms`, `status`.

## Janela de avaliação

- Coleta contínua; SLOs avaliados em janelas rolling de 30d (mês) e janelas curtas (1h) para alertas.

## Runbook curto para alertas críticos

1. Checar painéis de disponibilidade e latência (Grafana).
2. Verificar erros recentes nos logs (filtrar por requestId/traceId).
3. Checar saúde do banco (conexões, CPU, I/O) e do serviço de fila (se houver).
4. Se for problema de deployment/novo release: reverter para versão anterior.
5. Escalar para equipe de backend e infra, seguindo runbook de incidentes.

---

Última revisão: 2025-10-31
