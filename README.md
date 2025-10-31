# 💰 Kash - Financial Control App

[![CI/CD Pipeline](https://github.com/GabrielRezendeCoelho/Tech_Academy_7/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/GabrielRezendeCoelho/Tech_Academy_7/actions/workflows/ci-cd.yml)
[![Coverage](https://codecov.io/gh/GabrielRezendeCoelho/Tech_Academy_7/branch/main/graph/badge.svg)](https://codecov.io/gh/GabrielRezendeCoelho/Tech_Academy_7)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=kash&metric=security_rating)](https://sonarcloud.io/dashboard?id=kash)

## 🎯 Sobre o projeto

**Kash** é um aplicativo web/mobile para controle financeiro pessoal, desenvolvido seguindo os princípios de **Domain-Driven Design (DDD)** e **Entrega Contínua**. O sistema facilita o acompanhamento de saldo, despesas, histórico de movimentações e gestão de perfil do usuário, com uma arquitetura robusta e bem estruturada.

## ✨ Funcionalidades principais

- **Dashboard:** Exibe o saldo total, despesas, porcentagem de gastos e alertas de situação financeira
- **Despesas:** Cadastro, edição, exclusão e filtro de despesas por data
- **Saldo:** Adição, edição e exclusão de valores de saldo, com histórico detalhado
- **Histórico:** Lista todas as movimentações (entradas e saídas) do usuário
- **Perfil:** Visualização e edição dos dados do usuário
- **Menu:** Navegação central para todas as áreas do app
- **Cadastro/Login:** Autenticação de usuários com validação de senha e recuperação de acesso
- **Alertas:** Notificações sobre ações e situações financeiras (gastos excessivos)
- **Detecção Automática:** Sistema inteligente de detecção de gastos excessivos

## 🏗️ Arquitetura & Design Patterns

### Domain-Driven Design (DDD)
- **Bounded Contexts:** User Management, Financial Management, Notification
- **Entities:** User, Transaction, FinancialAccount
- **Value Objects:** Money, Email, Category
- **Aggregates:** FinancialAccount (root), User (root)
- **Domain Services:** FinancialService, AuthenticationService
- **Repository Pattern:** Abstração de acesso a dados
- **Domain Events:** Comunicação entre contexts

### Entrega Contínua (CI/CD)
- **Pipeline Automatizada:** Build, Test, Security Scan, Deploy
- **Multiple Environments:** Development, Staging, Production
- **Quality Gates:** Cobertura de testes, Security scan, Performance
- **Containerização:** Docker + Docker Compose
- **Rollback Strategy:** Automático em caso de falhas

## 🛠️ Tecnologias e linguagens utilizadas

### Frontend
- **Framework:** [React Native](https://reactnative.dev/) com Expo
- **Language:** TypeScript
- **Navigation:** Expo Router
- **Styling:** Styled Components & StyleSheet
- **Icons:** [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)
- **Storage:** Async Storage
- **Testing:** Jest + React Native Testing Library

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
