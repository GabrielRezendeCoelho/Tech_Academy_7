# Segurança e CI/CD - Checklist e Estratégia de Deploy

**Data:** 2025-11-20  
**Versão:** 1.0  
**Projeto:** Tech Academy 7 - Sistema Financeiro Kash

---

## 1. Segurança CI/CD Pipeline

### 1.1 ✅ Segurança de Código (Implementado Parcialmente)

#### SAST (Static Application Security Testing)
- ⚠️ **Não implementado:** Ferramentas como SonarQube, Snyk Code
- **Recomendação:** Adicionar ao GitHub Actions
```yaml
# .github/workflows/security.yml
- name: Run Snyk Security Scan
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high
```

#### Dependency Scanning
- ✅ **npm audit** executado localmente
- ⚠️ **GitHub Dependabot:** Configurado mas não ativo
- **Recomendação:** Ativar Dependabot Alerts e Pull Requests
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

#### Secret Scanning
- ⚠️ **Não implementado:** Ferramentas como GitGuardian, TruffleHog
- **Recomendação:** GitHub Secret Scanning (ativar no repo)
- **Prevenção:**
  - Nunca commitar .env files (já no .gitignore ✅)
  - Usar GitHub Secrets para CI/CD
  - Rotação periódica de JWT_SECRET, DB_PASS

---

### 1.2 ✅ Segurança de Container (Implementado Parcialmente)

#### Docker Image Scanning
- ⚠️ **Trivy:** Mencionado no CI_CD_PIPELINE.md mas não configurado
- **Recomendação:** Adicionar scan ao workflow
```yaml
- name: Scan Docker image with Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'kash-backend:latest'
    format: 'sarif'
    severity: 'CRITICAL,HIGH'
    exit-code: '1'  # Fail build se vulnerabilidade crítica
```

#### Base Image Security
- ✅ **Multi-stage builds** no Dockerfile (reduz surface de ataque)
- ⚠️ Base image: `node:22` → Recomendação: `node:22-alpine` (menor e mais seguro)
```dockerfile
# backend/Dockerfile (sugerido)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:22-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs  # ← Não executar como root
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

### 1.3 ⚠️ Segurança de Infraestrutura (Não Implementado)

#### Least Privilege
- **Database User:** Criar user com privilégios mínimos
```sql
-- Criar user apenas com SELECT, INSERT, UPDATE, DELETE
CREATE USER 'kash_app'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON kash_db.* TO 'kash_app'@'%';
FLUSH PRIVILEGES;
```

#### Network Segmentation
- **Docker Network:** Isolar MySQL e Redis em rede privada
```yaml
# docker-compose.yml
networks:
  backend:
    driver: bridge
  frontend:
    driver: bridge

services:
  mysql:
    networks:
      - backend  # Não exposto publicamente
  redis:
    networks:
      - backend
  api:
    networks:
      - backend
      - frontend
```

#### Secrets Management
- ⚠️ **Atualmente:** .env file (inseguro para produção)
- **Recomendação produção:** AWS Secrets Manager, Azure Key Vault, HashiCorp Vault
```typescript
// backend/src/config/secrets.ts (exemplo)
import { SecretsManager } from 'aws-sdk';

async function getSecret(name: string): Promise<string> {
  const client = new SecretsManager({ region: 'us-east-1' });
  const data = await client.getSecretValue({ SecretId: name }).promise();
  return data.SecretString;
}

const DB_PASSWORD = await getSecret('kash/db/password');
```

---

## 2. CI/CD Pipeline

### 2.1 ✅ Workflow Atual (GitHub Actions)

**Arquivo:** `.github/workflows/ci.yml` (parcialmente implementado)

**Estágios atuais:**
1. ✅ **Build:** npm install, npm run build (TypeScript compilation)
2. ✅ **Test:** npm test (Jest unit tests)
3. ⚠️ **Docker Build:** Dockerfile existe mas não automatizado no workflow
4. ⚠️ **Deploy:** Não implementado

---

### 2.2 Pipeline Completo Recomendado

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Stage 1: Lint e Testes
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          
      - name: Install dependencies
        run: |
          cd backend
          npm ci
          
      - name: Lint
        run: npm run lint  # ESLint
        
      - name: Unit Tests
        run: npm test -- --coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info

  # Stage 2: Security Scans
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: |
          cd backend
          npm audit --audit-level=high
          
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
          
      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main

  # Stage 3: Build Docker Image
  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
        
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
          
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: |
            kash/backend:${{ github.sha }}
            kash/backend:latest
          cache-from: type=registry,ref=kash/backend:cache
          cache-to: type=registry,ref=kash/backend:cache,mode=max
          
      - name: Scan image with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'kash/backend:${{ github.sha }}'
          format: 'sarif'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

  # Stage 4: Deploy to Staging
  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to Kubernetes (Staging)
        uses: azure/k8s-deploy@v4
        with:
          manifests: |
            k8s/staging/deployment.yaml
            k8s/staging/service.yaml
          images: |
            kash/backend:${{ github.sha }}
          kubectl-version: 'latest'
          
      - name: Run smoke tests
        run: |
          curl -f https://staging.kash.app/health || exit 1

  # Stage 5: Deploy to Production
  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production  # Requer aprovação manual
    steps:
      - name: Deploy to Kubernetes (Blue-Green)
        uses: azure/k8s-deploy@v4
        with:
          strategy: blue-green
          manifests: |
            k8s/production/deployment.yaml
            k8s/production/service.yaml
          images: |
            kash/backend:${{ github.sha }}
          
      - name: Health check
        run: |
          for i in {1..10}; do
            if curl -f https://api.kash.app/health; then
              echo "Health check passed"
              exit 0
            fi
            sleep 5
          done
          exit 1
          
      - name: Rollback on failure
        if: failure()
        run: |
          kubectl rollout undo deployment/kash-backend -n production
```

---

## 3. Estratégias de Deploy

### 3.1 ⚠️ Rolling Update (Parcialmente Implementado)

**Status:** Docker Compose com restart policy, mas não em produção

**Configuração Kubernetes:**
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kash-backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1  # Max 1 pod indisponível
      maxSurge: 1        # Max 1 pod extra durante update
  template:
    spec:
      containers:
      - name: backend
        image: kash/backend:latest
        readinessProbe:  # ← Essencial para rolling update
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
```

**Fluxo:**
1. Deploy inicia novo pod (version 2.0)
2. Aguarda readinessProbe passar (10-15s)
3. Redireciona tráfego para novo pod
4. Termina 1 pod antigo (version 1.0)
5. Repete para próximos pods

**Downtime:** 0 segundos

---

### 3.2 ⚠️ Blue-Green Deployment (Não Implementado)

**Conceito:** Dois ambientes completos (Blue = atual, Green = novo)

**Fluxo:**
1. **Blue** rodando version 1.0 com 100% tráfego
2. Deploy **Green** com version 2.0 (paralelo ao Blue)
3. Executar smoke tests no Green
4. Se OK: Redirecionar load balancer 100% para Green
5. Se FAIL: Deletar Green, manter Blue

**Vantagens:**
- Rollback instantâneo (redireciona de volta para Blue)
- Testes completos em ambiente idêntico antes de tráfego real

**Ferramentas:** Kubernetes, AWS ECS, Azure App Service

```yaml
# k8s/service.yaml (Blue-Green com labels)
apiVersion: v1
kind: Service
metadata:
  name: kash-backend
spec:
  selector:
    app: kash-backend
    version: blue  # ← Trocar para "green" após validação
  ports:
    - port: 80
      targetPort: 3000
```

---

### 3.3 ⚠️ Canary Deployment (Não Implementado)

**Conceito:** Gradualmente redireciona tráfego para nova versão

**Fases:**
1. 5% tráfego → version 2.0 (monitora por 10 minutos)
2. 25% tráfego → version 2.0 (monitora por 10 minutos)
3. 50% tráfego → version 2.0 (monitora por 10 minutos)
4. 100% tráfego → version 2.0

**Métricas monitoradas:**
- Taxa de erro < 0.5%
- Latência p95 < 500ms
- CPU < 70%

**Rollback automático:** Se qualquer métrica falhar, reverte para 100% version 1.0

**Ferramentas:** Istio, Linkerd (Service Mesh), Flagger (Kubernetes)

```yaml
# Flagger canary config
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: kash-backend
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: kash-backend
  service:
    port: 3000
  analysis:
    interval: 1m
    threshold: 5  # Max 5 falhas consecutivas
    stepWeight: 10  # Aumenta 10% por vez
    metrics:
      - name: request-success-rate
        thresholdRange:
          min: 99.5  # Min 99.5% de sucesso
      - name: request-duration
        thresholdRange:
          max: 500  # Max 500ms p95
```

---

## 4. Checklist de Segurança Pré-Deploy

### Código
- ✅ Logs não contêm dados sensíveis (senhas, tokens, CPF completo)
- ✅ Senhas hashadas com bcrypt (rounds >= 10)
- ✅ JWT com expiração (1h)
- ⚠️ HTTPS obrigatório (Nginx configurado mas não testado)
- ⚠️ CORS configurado (falta whitelist de origins permitidos)

### Infraestrutura
- ✅ MySQL não exposto publicamente (port 3307 apenas localhost)
- ✅ Redis não exposto (port 6379 apenas localhost)
- ⚠️ Firewall rules (não configurado - Docker Compose local)
- ⚠️ SSL/TLS certificates (não configurado)

### Autenticação/Autorização
- ✅ JWT validado em rotas protegidas
- ⚠️ RBAC (role-based access control) **não implementado**
- ⚠️ Rate limiting (Nginx configurado mas não testado)

### Dependencies
- ✅ npm audit executado (22 vulnerabilities - non-blocking)
- ⚠️ Dependency updates periódicos (não automatizado)

### Backup
- ⚠️ Backup de banco de dados **não configurado**
- ⚠️ Disaster recovery plan **não documentado**

---

## 5. Monitoramento Pós-Deploy

### Golden Signals
1. **Latency:** p50, p95, p99 (target: p95 < 500ms)
2. **Traffic:** Requests por segundo
3. **Errors:** Taxa de erro (target: < 0.5%)
4. **Saturation:** CPU, memória, disk I/O

### Alerts Críticos
```yaml
# prometheus/alerts.yml
groups:
  - name: production
    rules:
      - alert: HighErrorRate
        expr: |
          rate(kash_http_requests_total{status=~"5.."}[5m]) 
          / rate(kash_http_requests_total[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate (> 1%)"
          
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, 
            rate(http_request_duration_seconds_bucket[5m])
          ) > 1.0
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "p95 latency > 1s"
          
      - alert: DeploymentFailed
        expr: |
          kube_deployment_status_replicas_unavailable{deployment="kash-backend"} > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Deployment has unavailable replicas"
```

---

## 6. Rollback Strategy

### Rollback Automático
**Trigger:** Health check falha 3x consecutivas após deploy

```bash
# Kubernetes rollback
kubectl rollout undo deployment/kash-backend -n production

# Verificar history
kubectl rollout history deployment/kash-backend

# Rollback para versão específica
kubectl rollout undo deployment/kash-backend --to-revision=5
```

### Rollback Manual
**Processo:**
1. Identificar deploy problemático (logs, métricas)
2. Decidir: rollback completo ou hotfix?
3. Se rollback: Executar comando acima
4. Validar health check
5. Monitorar por 30 minutos
6. Post-mortem: Documentar causa raiz

---

## 7. Compliance e Auditoria

### LGPD (Lei Geral de Proteção de Dados)
- ✅ Senhas hashadas (não reversíveis)
- ⚠️ Logs de acesso a dados pessoais (não implementado)
- ⚠️ Endpoint para exclusão de dados (LGPD Art. 18) (não implementado)
- ⚠️ Consent tracking (não implementado)

### Audit Logs
**Recomendação:** Log todas operações de mutação

```typescript
// backend/src/middleware/auditLog.ts
export function auditLogMiddleware() {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logger.info({
          event: 'AUDIT',
          userId: req.user?.id,
          action: `${req.method} ${req.path}`,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          timestamp: new Date().toISOString()
        }, 'Audit log');
      }
      return originalJson(body);
    };
    
    next();
  };
}
```

---

## 8. Resumo de Status

| Item | Status | Prioridade | Prazo |
|------|--------|------------|-------|
| **CI/CD Workflow completo** | ⚠️ Parcial | 🔴 Alta | Sprint 1 |
| **Trivy image scanning** | ⚠️ Não implementado | 🟡 Média | Sprint 1 |
| **Dependabot Alerts** | ⚠️ Inativo | 🟢 Baixa | Sprint 2 |
| **RBAC (admin/user)** | ⚠️ Não implementado | 🔴 Alta | Sprint 1 |
| **Blue-Green Deploy** | ⚠️ Não implementado | 🟡 Média | Sprint 3 |
| **Rate Limiting (teste)** | ⚠️ Config pronta | 🟡 Média | Sprint 2 |
| **SSL/TLS Certificates** | ⚠️ Não configurado | 🔴 Alta | Antes de prod |
| **Database Backups** | ⚠️ Não configurado | 🔴 Alta | Antes de prod |
| **Secrets Management** | ⚠️ .env file | 🔴 Alta | Antes de prod |
| **LGPD Compliance** | ⚠️ Parcial | 🟡 Média | Sprint 4 |

---

**Última atualização:** 2025-11-20  
**Responsável:** Tech Academy 7 Team  
**Próxima revisão:** Após primeiro deploy em staging
