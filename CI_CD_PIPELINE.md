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