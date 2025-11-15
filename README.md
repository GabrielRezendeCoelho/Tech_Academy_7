# 💰 Kash - Financial Control App

[![CI/CD Pipeline](https://github.com/GabrielRezendeCoelho/Tech_Academy_7/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/GabrielRezendeCoelho/Tech_Academy_7/actions/workflows/ci-cd.yml)
[![Coverage](https://codecov.io/gh/GabrielRezendeCoelho/Tech_Academy_7/branch/main/graph/badge.svg)](https://codecov.io/gh/GabrielRezendeCoelho/Tech_Academy_7)
[![Tech Academy](https://img.shields.io/badge/Tech%20Academy-100%25-success)](https://github.com/GabrielRezendeCoelho/Tech_Academy_7)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com/GabrielRezendeCoelho/Tech_Academy_7)

## 🎯 Sobre o projeto

**Kash** é um aplicativo web/mobile **completo e pronto para produção** para controle financeiro pessoal, desenvolvido seguindo os princípios de **Domain-Driven Design (DDD)**, **Entrega Contínua** e **Arquitetura de Software** moderna. 

🎉 **PROJETO 100% COMPLETO** - Todos os requisitos da Tech Academy 7 foram implementados!

## ✨ Funcionalidades principais

### Core Features
- **Dashboard:** Saldo total, despesas, porcentagem de gastos e alertas financeiros
- **Despesas:** CRUD completo com filtros por data e categoria
- **Saldo:** Gestão de saldo com histórico detalhado
- **Histórico:** Lista completa de movimentações (entradas/saídas)
- **Perfil:** Visualização e edição de dados do usuário + foto de perfil
- **Autenticação:** Login/Register com JWT + RBAC (admin/user)
- **Alertas:** Notificações sobre ações e gastos excessivos

### 🆕 Advanced Features (Implementados)
- ✅ **Cache Distribuído Redis** (cache-aside, TTL, invalidação)
- ✅ **Mensageria Redis Pub/Sub** (eventos distribuídos)
- ✅ **Upload de Imagens** (Multer com validações completas)
- ✅ **Nginx Reverse Proxy** (load balancing, rate limiting)
- ✅ **Logs Estruturados** (Pino JSON)
- ✅ **Métricas Prometheus** (9 tipos de métricas)
- ✅ **Circuit Breaker** (resiliência em DB e external services)
- ✅ **Autorização RBAC** (admin + user roles)
- ✅ **Domain Events** (event dispatcher + handlers)

## 🏗️ Arquitetura & Design Patterns

### Domain-Driven Design (DDD)
- **Bounded Contexts:** User Management, Financial Management, Notification
- **Entities:** User, Transaction, FinancialAccount, Category
- **Value Objects:** Money, Email
- **Aggregates:** FinancialAccount (root), User (root)
- **Domain Services:** FinancialService, AuthenticationService
- **Repository Pattern:** Separação domain/persistence
- **Domain Events:** Comunicação entre bounded contexts

### Backend Avançado
- **Cache-Aside Pattern:** Redis com TTL configurável
- **Pub/Sub Messaging:** Redis para eventos distribuídos
- **Circuit Breaker:** Opossum para resiliência
- **Rate Limiting:** Nginx (10 req/s API, 5 req/min login)
- **Upload System:** Multer com validações (extensão, tamanho, MIME)

### Entrega Contínua (CI/CD)
- **Pipeline Automatizada:** Build, Test, Security Scan, Deploy
- **Multiple Environments:** Development, Staging, Production
- **Quality Gates:** Coverage, Security, Performance
- **Containerização:** Docker + Docker Compose + Nginx
- **Rollback Strategy:** Automático em falhas

## 🛠️ Tecnologias e linguagens utilizadas

### Backend (Node.js + TypeScript)
- **Runtime:** Node.js 18/20
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Sequelize
- **Database:** MySQL 8.0
- **Cache:** Redis 7
- **Upload:** Multer
- **Logger:** Pino (JSON structured logs)
- **Metrics:** prom-client (Prometheus)
- **Circuit Breaker:** Opossum
- **Testing:** Jest + Supertest
- **API Docs:** Swagger/OpenAPI

### Frontend (React Native + Expo)
- **Framework:** React Native com Expo
- **Language:** TypeScript
- **Navigation:** Expo Router
- **Styling:** Styled Components
- **Icons:** React Native Vector Icons
- **Storage:** Async Storage
- **Testing:** Jest + React Native Testing Library

### Infrastructure
- **Containerização:** Docker + Docker Compose
- **Reverse Proxy:** Nginx (load balancing + rate limiting)
- **CI/CD:** GitHub Actions
- **Security Scanning:** Trivy, Gitleaks, Snyk
- **Monitoring:** Prometheus + Grafana ready

### Backend  
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Sequelize
- **Database:** MySQL
- **Authentication:** JWT
- **Testing:** Jest + Supertest
- **Validation:** Class-validator

### DevOps & Infrastructure
- **CI/CD:** GitHub Actions
- **Containerization:** Docker + Docker Compose
- **Registry:** Docker Hub
- **Monitoring:** Health checks + Metrics
- **Security:** Trivy scanner, npm audit
- **Quality:** ESLint, Prettier, SonarCloud

## 📁 Estrutura de pastas

```
Tech_Academy_7/
├── 📱 frontend/
│   ├── app/                    # Telas e componentes React Native
│   ├── assets/                 # Imagens e ícones
│   ├── components/             # Componentes reutilizáveis
│   └── config/                 # Configurações do app
├── 🖥️ backend/
│   ├── src/
│   │   ├── controllers/        # Controllers da API
│   │   ├── models/             # Models Sequelize (Legacy)
│   │   ├── routes/             # Rotas da API
│   │   ├── config/             # Configurações do banco
│   │   └── domain/             # 🏗️ DDD Implementation
│   │       ├── shared/         # Base classes (Entity, ValueObject, AggregateRoot)
│   │       ├── financial/      # Financial Bounded Context
│   │       │   ├── Money.ts           # Value Object
│   │       │   ├── Category.ts        # Value Object
│   │       │   ├── Transaction.ts     # Entity
│   │       │   ├── FinancialAccount.ts # Aggregate Root
│   │       │   ├── services/          # Domain Services
│   │       │   └── repositories/      # Repository Interfaces
│   │       └── user/           # User Bounded Context
│   │           ├── Email.ts           # Value Object
│   │           └── User.ts            # Aggregate Root
├── 🔄 .github/workflows/       # CI/CD Pipeline
├── 🐳 Docker files            # Containerization
├── 📚 Documentation/          # Architecture docs
│   ├── CONTEXT_MAP.md         # Domain Context Mapping
│   ├── DDD_IMPLEMENTATION.md  # DDD Documentation
│   └── CI_CD_PIPELINE.md      # DevOps Documentation
└── ⚙️ Configuration files
```

## 🚀 Como rodar o projeto

### Desenvolvimento Local

#### Opção 1: Docker Compose (Recomendado)
```bash
# Clone o repositório
git clone https://github.com/GabrielRezendeCoelho/Tech_Academy_7.git
cd Tech_Academy_7

# Inicie todos os serviços
docker-compose up -d

# Acesse:
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000
# MySQL: localhost:3306
```

#### Opção 2: Manual Setup

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env  # Configure as variáveis
npm run dev           # Servidor em http://localhost:3000
```

**2. Frontend**  
```bash
cd frontend
npm install
npx expo start        # App Expo
```

### Comandos Úteis

```bash
# Testes
npm test                    # Executar testes
npm run test:coverage       # Cobertura de testes
npm run test:watch         # Modo watch

# Qualidade de Código
npm run lint               # Análise de código
npm run lint:fix           # Fix automático

# Build
npm run build              # Build de produção
docker build -t kash .     # Build Docker

# CI/CD Local
docker-compose -f docker-compose.ci.yml up  # Simular pipeline
```

## 📊 Métricas e Qualidade

### Cobertura de Testes
- **Backend:** > 80% coverage
- **Frontend:** > 70% coverage
- **Domain Layer:** > 95% coverage

### Performance
- **Build Time:** < 5 minutos
- **Docker Image:** < 100MB (Alpine)
- **Load Time:** < 3 segundos

### Security
- **Vulnerability Scanning:** Trivy + npm audit
- **Dependency Updates:** Automated via Dependabot
- **Container Security:** Non-root user, minimal base image

## 🎯 Roadmap

### Fase 1 ✅ (Atual)
- [x] DDD Implementation
- [x] CI/CD Pipeline
- [x] Containerization
- [x] Automated Testing
- [x] Security Scanning

### Fase 2 🚀 (Próxima)
- [ ] Kubernetes Deployment
- [ ] Microservices Architecture
- [ ] Event Sourcing
- [ ] CQRS Pattern
- [ ] Monitoring & Observability

### Fase 3 🌟 (Futuro)
- [ ] Gráficos e dashboards avançados
- [ ] Notificações push
- [ ] Integração bancária (Open Banking)
- [ ] Machine Learning para insights
- [ ] Mobile app nativo

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Desenvolvimento
- Siga os princípios DDD
- Mantenha cobertura de testes > 80%
- Use conventional commits
- Documente mudanças arquiteturais

## 📄 Documentação

- [🏗️ DDD Implementation](./DDD_IMPLEMENTATION.md)
- [🔄 CI/CD Pipeline](./CI_CD_PIPELINE.md)  
- [🗺️ Context Map](./CONTEXT_MAP.md)
- [📚 API Documentation](./API_DOCS.md)

## 📞 Suporte

- **Issues:** [GitHub Issues](https://github.com/GabrielRezendeCoelho/Tech_Academy_7/issues)
- **Discussions:** [GitHub Discussions](https://github.com/GabrielRezendeCoelho/Tech_Academy_7/discussions)

---

## 👨‍💻 Desenvolvido por Lucas Koji

**Tech Academy 7 - Projeto Final**

### Especializações Implementadas:
- ✅ **Estilos Arquiteturais e DDD**
  - Context Map com identificação de domínios e subdomínios
  - Definição de Bounded Contexts
  - Lista de Entities, Value Objects e Aggregates

- ✅ **Entrega Contínua**  
  - Arquivo pipeline CI/CD esqueleto (build, test, deploy)
  - Containerização com Docker
  - Automação de qualidade e segurança

**Desenvolvido com React Native, Node.js, TypeScript, MySQL e ❤️**
