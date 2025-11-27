```markdown
# Quality Scenarios (cenários de qualidade)

Data: 2025-11-04

Este documento lista cenários de qualidade relevantes para o projeto, com métricas e critérios de aceitação.

## 1. Disponibilidade

- Cenário: Usuário consulta saldo durante horário de pico.
- Estímulo: 10.000 requisições concorrentes para endpoint /accounts/:id/saldo em 1 minuto.
- Ambiente: Staging com configuração próxima à produção.
- Resposta desejada: 99.9% de sucesso (2xx) e 95% das requisições com latência < 500ms.
- Métrica: Uptime, erro rate, p95 latency.

## 2. Performance

- Cenário: Geração de relatório mensal para um usuário com muitos lançamentos.
- Estímulo: Request para /reports/monthly para usuário com 100k lançamentos.
- Resposta desejada: relatório gerado em < 5 segundos; uso de memória < 1GB.
- Métrica: tempo de resposta, consumo de CPU/memória.

## 3. Segurança

- Cenário: Tentativa de acesso não autorizado a recurso de outro usuário.
- Estímulo: JWT válido mas com userId diferente tentando acessar /transactions/:id.
- Resposta desejada: 403 Forbidden, não expor dados do recurso.
- Métrica: taxa de vazamentos (zero), cobertura de testes de autorização.

## 4. Confiabilidade / Resiliência

- Cenário: Queda temporária do banco de dados primário (5 minutos) com failover para réplica.
- Estímulo: DB primário indisponível.
- Resposta desejada: degradar funcionalidades não-críticas, operações críticas enfileiradas/rejeitadas com respostas apropriadas; falhas tratadas sem corrupção de dados.
- Métrica: tempo de recuperação (RTO), perda de dados (RPO).

## 5. Observabilidade

- Cenário: Diagnóstico de erro em produção.
- Estímulo: Erro 500 reproduzido em endpoint crítico.
- Resposta desejada: logs correlacionáveis por requestId, traces disponíveis para o fluxo completo, alerta criado em canal de ops.
- Métrica: tempo médio para abrir issue/alerta após detecção.

## 6. Escalabilidade

- Cenário: Growth súbito de 5x no tráfego por 24 horas.
- Estímulo: aumento gradual do tráfego até 5x.
- Resposta desejada: sistema escala horizontalmente sem downtime, com degradação graciosa de funções não críticas.
- Métrica: autoscaling triggers, custo por hora.

## Critérios de aceitação gerais

- Documentar pelo menos 5 cenários com métricas mensuráveis.
- Implementar monitoramento das métricas listadas em ambiente de staging.

```
