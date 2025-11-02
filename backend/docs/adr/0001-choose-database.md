# ADR 0001 — Escolha do banco de dados

Data: 2025-10-31  
Status: Aceito

## Contexto

O projeto é uma API REST (Node.js + TypeScript) com modelos relacionais básicos: usuários, categorias e lançamentos (saldos).
O repositório já usa Sequelize e a dependência `mysql2` está presente. Precisamos padronizar e documentar a escolha do banco de dados
para desenvolvimento e produção.

## Decisão

Usar MySQL (compatível com MariaDB) como banco de dados relacional primário em produção. No Node.js, usar Sequelize (ORM já
presente no projeto) com o driver `mysql2`.

## Justificativa

- Alinhamento com o código atual: o projeto já depende de `mysql2` e Sequelize foi utilizado nos models; isso reduz trabalho e acelera entrega.
- Modelo de dados relacional: entidades possuem relacionamentos e constraints — um RDBMS é a escolha natural.
- Maturidade e ecossistema: MySQL/MariaDB são amplamente suportados em provedores gerenciados (RDS/Cloud SQL) com boas ferramentas de backup e replicação.
- Operação e custo: imagens Docker, tutoriais e expertise são abundantes; curva operacional moderada para cargas pequenas/médias.
- ACID e integridade: atende requisitos transacionais do domínio financeiro (saldos, lançamentos).

## Alternativas consideradas

1. PostgreSQL

   - Prós: recursos avançados (JSONB, índices parciais, conformidade SQL superior).
   - Contras: exigiria ajustes operacionais e, possivelmente, tuning.

2. SQLite (apenas dev)

   - Prós: zero-config, rápido para testes locais.
   - Contras: não recomendado para produção; limitações em concorrência e replicação.

3. MongoDB / NoSQL

   - Prós: flexibilidade de esquema.
   - Contras: quebra o modelo relacional e força reescrita do domínio; perde integridade referencial nativa.

4. Serviços NoSQL gerenciados (DynamoDB, Firestore)

   - Prós: operação simplificada e escalabilidade.
   - Contras: modelo de dados e consultas muito diferentes; maior risco de lock-in e sobrecarga de mudança.

5. NewSQL / soluções distribuídas (CockroachDB, Vitess)
   - Prós: escalabilidade horizontal com SQL.
   - Contras: complexidade operacional e custo, desnecessário para o estágio atual.

## Consequências

- Positivas:

  - Implementação rápida e compatível com o código existente.
  - Amplo suporte operacional e opções de hospedagem gerenciada.
  - Integridade transacional garantida para operações financeiras.

- Negativas / pendências:
  - Alguns recursos avançados do PostgreSQL podem não estar disponíveis.
  - Necessidade de configurar backups, monitoramento e políticas de failover.
  - Dependência de uma solução SQL tradicional para operações futuras.

## Requisitos operacionais / follow-ups

1. Adicionar migrations (Sequelize Migrations) e evitar alterações diretas em produção.
2. Configurar backups automáticos (dump/replica/backup gerenciado).
3. Ajustar pool de conexões do Sequelize (`pool` config) conforme carga.
4. Documentar variáveis de ambiente em `backend/.env.example`: DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME.
5. Criar um `docker-compose` de desenvolvimento com MySQL para facilitar onboarding e CI.

## Plano de rollout

1. Local & CI: usar container MySQL para desenvolvimento e testes.
2. Migrations: garantir que mudanças de schema usem migrations versionadas.
3. Staging: executar migrations e validar integridade/performance.
4. Produção: provisionar instância gerenciada ou cluster; executar migration com backup e janela de deploy.

## Referências

- Sequelize: https://sequelize.org/
- MySQL: https://www.mysql.com/
- MariaDB: https://mariadb.org/
