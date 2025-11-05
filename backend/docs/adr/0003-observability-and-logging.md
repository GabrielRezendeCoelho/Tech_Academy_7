```markdown
# ADR 0003 — Observabilidade e Logging

Data: 2025-11-04
Status: Proposto

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

1. Instalar e configurar `pino` ou `winston` com saída JSON e níveis configuráveis via env.
2. Middleware que injeta `requestId` (X-Request-Id) e o inclui nos logs.
3. Expor métricas básicas: request_rate, latency_histogram, error_rate, db_queue_length.
4. Adicionar integração simples de OpenTelemetry e enviar spans para Jaeger em staging.
5. Documentar instruções de como ativar e acessar dashboards / traces.

## Critérios de aceitação

- Logs estruturados presentes em todos os serviços principais.
- Métricas básicas visíveis no Prometheus/Grafana em staging.
- Tracing funcionando em fluxo crítico (login -> consulta saldo).

```
