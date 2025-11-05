# CI/CD Pipeline - Entrega Contínua

## Visão Geral

Este projeto implementa uma pipeline completa de CI/CD (Continuous Integration/Continuous Deployment) usando GitHub Actions para automatizar build, teste e deploy do aplicativo Kash.

## Pipeline Stages

### 1. Continuous Integration (CI)

#### Backend CI Jobs
```yaml
backend-ci:
  - Checkout código
  - Setup Node.js (matriz de versões 18.x, 20.x)
  - Install dependencies
  - Lint code (ESLint)
  - Type checking (TypeScript)
  - Run tests (Jest)
  - Generate coverage
  - Upload coverage to Codecov
```

#### Frontend CI Jobs  
```yaml
frontend-ci:
  - Checkout código
  - Setup Node.js (matriz de versões 18.x, 20.x)
  - Install dependencies
  - Lint code (Expo lint)
  - Type checking (TypeScript)  
  - Run tests (Jest)
  - Build for production
```

### 2. Security Scanning

```yaml
security-scan:
  - Trivy vulnerability scanner
  - Upload SARIF results to GitHub Security
  - NPM audit for dependencies
  - Security reports generation
```

### 3. Containerization

#### Docker Build & Push
```yaml
docker-build:
  - Setup Docker Buildx
  - Login to Docker Hub
  - Build backend image with cache
  - Build frontend image with cache
  - Push to registry with tags (latest + SHA)
```

#### Multi-stage Dockerfiles
- **Backend**: Node.js Alpine com otimizações de segurança
- **Frontend**: Nginx Alpine para servir aplicação web
- **Caching**: Layer caching para builds rápidos

### 4. Deployment Pipeline

#### Staging Deployment
```yaml
deploy-staging:
  - Deploy to staging environment
  - Run health checks
  - Smoke tests
```

#### Integration Tests
```yaml
integration-tests:
  - End-to-end tests against staging
  - API integration tests
  - Performance tests
```

#### Production Deployment
```yaml
deploy-production:
  - Deploy to production
  - Health checks
  - Rollback on failure
  - Monitoring alerts
```

## Environments

### Development
- **Trigger**: Push para qualquer branch
- **Actions**: CI only (build, test, lint)

### Staging  
- **Trigger**: Push para `main`
- **Actions**: CI + Deploy to staging + Integration tests

### Production
- **Trigger**: Aprovação manual após staging
- **Actions**: Deploy to production + Health checks

## Quality Gates

### 1. Code Quality
- ✅ ESLint passa sem erros
- ✅ TypeScript compila sem erros
- ✅ Cobertura de testes > 80%

### 2. Security
- ✅ Vulnerability scan passa
- ✅ Dependencies audit limpo
- ✅ Container security scan

### 3. Performance
- ✅ Build time < 5 minutos
- ✅ Docker image size otimizado
- ✅ Load time < 3 segundos

## Checklist de Segurança do Pipeline

Para reduzir riscos, aplicar as verificações abaixo automaticamente na pipeline CI/CD (por exemplo, GitHub Actions). As ferramentas sugeridas são exemplos — adapte conforme política organizacional.

1) Dependency & SCA (Software Composition Analysis)
  - Executar `npm audit` e uma ferramenta de SCA (Snyk, OWASP Dependency-Check, ou `npm audit` + relatório).
  - Critério: falhar o job se existirem CVEs com severidade >= HIGH sem justificativa registrada.

2) Static Application Security Testing (SAST)
  - Rodar ferramentas como Semgrep, CodeQL, e regras de segurança do ESLint (ex.: eslint-plugin-security).
  - Subir resultados em SARIF para integração com GitHub Security.

3) Secret Scanning
  - Executar `gitleaks`, `git-secrets` ou `truffleHog` em PRs. Bloquear merge se credenciais ativas forem encontradas.

4) Container Image Scanning
  - Usar Trivy ou Grype para escanear imagens construídas antes do push.
  - Critério: fail build se vulnerabilidades CRITICAL encontradas na imagem final.

5) IaC Scanning
  - Verificar templates de infraestrutura (docker-compose, Helm, Terraform) com Checkov, tflint ou KICS.

6) SBOM & Reproducibility
  - Gerar SBOM (CycloneDX/SPDX) e armazenar como artefato do pipeline.

7) License & Policy Checks
  - Verificar licenças de dependências e aplicar policy gates (ex.: bloquear licenças não aprovadas).

8) Runtime Hardening & Dockerfile checks
  - Verificar que Dockerfiles usem USER não-root, que variáveis sensíveis não sejam embutidas e que a imagem seja multi-stage.

9) Security Tests em Staging
  - Executar smoke tests de segurança (autenticação/autorização, endpoints críticos) em ambiente de staging após deploy.

10) Alerting e Remediação
  - Enviar resultados críticos para canal de ops (Slack/Teams) e abrir issues automatizadas para vulnerabilidades bloqueantes.

Exemplo resumido de job (GitHub Actions):

```yaml
security:
  runs-on: ubuntu-latest
  steps:
   - uses: actions/checkout@v3
   - name: Setup Node
    uses: actions/setup-node@v4
    with:
      node-version: '18'
   - name: Install deps
    run: npm ci
   - name: Run Snyk (SCA)
    uses: snyk/actions/node@master
    with:
      args: test
   - name: Run Semgrep (SAST)
    uses: returntocorp/semgrep-action@v1
   - name: Trivy scan
    uses: aquasecurity/trivy-action@master

# Defina quais resultados quebram o build (ex.: CVE >= HIGH, secrets detectados)
```

Recomendação de política de falha:
- Falhar PR se: SAST reportar vulnerabilidade HIGH/CRITICAL, SCA encontrar CVE >= HIGH, secret-scan detectar segredos ativos.
- Para achados menores: abrir issue automaticamente e bloquear merge até tratativa dentro do SLA definido.

## Secrets Configuration

### Required GitHub Secrets
```bash
DOCKER_USERNAME     # Docker Hub username
DOCKER_PASSWORD     # Docker Hub password
STAGING_HOST        # Staging server host
STAGING_KEY         # SSH key for staging
PRODUCTION_HOST     # Production server host  
PRODUCTION_KEY      # SSH key for production
```

## Branch Strategy

```
main (production)
├── develop (staging)
├── feature/user-auth
├── feature/financial-tracking
└── hotfix/critical-bug
```

### Branch Rules
- **main**: Protegido, requer PR + reviews + CI green
- **develop**: Integration branch, auto-deploy to staging
- **feature/***: Feature branches, CI on push
- **hotfix/***: Critical fixes, fast-track to main

## Monitoring & Alerting

### Health Checks
```typescript
// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VERSION
  });
});
```

### Metrics Collection
- Application performance metrics
- Container resource usage
- Deployment success/failure rates
- Test coverage trends

## Rollback Strategy

### Automatic Rollback
- Health check failures trigger automatic rollback
- Previous Docker images maintained for quick revert
- Database migrations include rollback scripts

### Manual Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/kash-backend
kubectl rollout undo deployment/kash-frontend
```

## Performance Optimizations

### Docker Optimizations
- Multi-stage builds reduzem tamanho final
- Layer caching acelera builds
- Alpine images para segurança e tamanho

### Pipeline Optimizations  
- Parallel job execution
- Dependency caching
- Incremental builds
- Matrix strategy para múltiplas versões

## Usage Examples

### Triggering Deployment
```bash
# Deploy to staging
git push origin main

# Deploy to production  
# Create release through GitHub UI
# Or tag release
git tag v1.2.3
git push origin v1.2.3
```

### Viewing Pipeline Status
```bash
# GitHub CLI
gh workflow list
gh run list --workflow=ci-cd.yml

# Check deployment status
gh api repos/owner/repo/deployments
```

### Local Development
```bash
# Run same checks locally
npm run lint
npm run test
npm run build

# Test Docker build
docker-compose build
docker-compose up -d
```

## Troubleshooting

### Common Issues
1. **Build Failures**: Check lint errors, type errors
2. **Test Failures**: Check test output, update snapshots
3. **Security Failures**: Update vulnerable dependencies
4. **Deploy Failures**: Check environment variables, secrets

### Debug Commands
```bash
# Check pipeline logs
gh run view <run_id> --log

# SSH to staging for debugging  
ssh -i staging_key user@staging_host

# Check container logs
docker logs kash-backend
docker logs kash-frontend
```

Esta pipeline garante que cada mudança seja adequadamente testada, verificada por segurança e implantada de forma controlada, seguindo as melhores práticas de DevOps.