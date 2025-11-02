# Estratégias de Resiliência — Tech Academy API

Resumo de padrões e táticas para tornar o sistema resistente a falhas.

## Padrões recomendados

1. Timeouts

   - Definir timeout razoável por chamada externa e operação de DB (ex.: 2s para chamadas rápidas, 10s para operações longas).

2. Retries com Backoff exponencial

   - Repetir operações transitórias (e.g., requests para serviços externos) com backoff exponencial e jitter.
   - Limitar número de tentativas (ex.: 3) e não aplicar para operações não-idempotentes sem estratégia de idempotência.

3. Circuit Breaker

   - Abrir o circuito quando uma dependência falhar repetidamente, evitando sobrecarregar serviços em falha.
   - Políticas típicas: janela de 10s, threshold 50% de falhas, timeout de recuperação 30s.

4. Bulkheads

   - Isolar recursos (threads, conexões, pools) por tipo de carga para evitar contaminação entre subsistemas.

5. Graceful Degradation

   - Quando uma dependência falhar, degradar funcionalidade (ex.: retornar cache ou versão simplificada da resposta) em vez de falhar completamente.

6. Backpressure & Queueing

   - Desacoplar escrita/processamento intensivo usando filas (e.g., RabbitMQ, AWS SQS) para suavizar picos.

7. Caching

   - Cachear leituras frequentes e não-críticas (Redis) com TTL apropriado.

8. Idempotência

   - Projetar endpoints de escrita (ou operações via fila) para serem idempotentes (usar request-id ou token de idempotência).

9. Health checks & Readiness

   - Health check simples (GET /health) e readiness probe que verifica dependências (DB, fila). Usar nas plataformas de orquestração.

10. Chaos Engineering (opcional)

- Testar hipóteses de resiliência inserindo falhas controladas (latência, drop de conexões).

## Estratégias de implantação

- Rolling updates com readiness checks.
- Blue/Green ou Canary deployments para minimizar impacto de releases.

## Testes e validação

- Testes automatizados para remarcar retries, circuit-breaker e bulkheads.
- Testes de carga para validar comportamento sob estresse.

---

Última revisão: 2025-10-31
