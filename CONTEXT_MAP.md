# Context Map - Kash Application

## Bounded Contexts

### 1. User Management Context
**Responsabilidade**: Gerenciamento de usuários, autenticação e autorização
- **Entities**: User
- **Value Objects**: Email
- **Services**: AuthenticationService, UserRegistrationService
- **Repositories**: UserRepository

### 2. Financial Management Context  
**Responsabilidade**: Controle financeiro, transações e saldos
- **Aggregates**: FinancialAccount
- **Entities**: Transaction
- **Value Objects**: Money, Category
- **Services**: TransactionService, BalanceCalculationService
- **Repositories**: FinancialAccountRepository, TransactionRepository

### 3. Notification Context
**Responsabilidade**: Alertas e notificações para usuários
- **Entities**: Notification, Alert
- **Value Objects**: NotificationMessage
- **Services**: NotificationService, ExcessiveSpendingService

## Context Relationships

```
┌─────────────────────┐    Customer/Supplier    ┌──────────────────────────┐
│   User Management   │ ◄────────────────────── │  Financial Management    │
│     Context         │                         │        Context           │
└─────────────────────┘                         └──────────────────────────┘
          │                                                   │
          │                                                   │
          │ Published Language                                │ Open Host Service
          ▼                                                   ▼
┌─────────────────────┐                         ┌──────────────────────────┐
│   Notification      │ ◄────── Conformist ──── │     Analytics Context    │
│     Context         │                         │                          │
└─────────────────────┘                         └──────────────────────────┘
```

### Relationship Patterns

1. **User Management → Financial Management** (Customer/Supplier)
   - User Management fornece informações de usuário autenticado
   - Financial Management consome essas informações para associar transações

2. **Financial Management → Notification** (Open Host Service)
   - Financial Management publica eventos de transações
   - Notification Context se inscreve para gerar alertas

3. **Financial Management → Analytics** (Conformist)
   - Analytics Context consome dados financeiros para relatórios
   - Segue o modelo definido pelo Financial Management

## Integration Events

### User Domain Events
- `UserCreated`
- `UserActivated` 
- `UserDeactivated`
- `UserNameUpdated`

### Financial Domain Events
- `TransactionAdded`
- `BalanceUpdated`
- `ExcessiveSpendingDetected`

## Anti-Corruption Layer

O Financial Management Context implementa uma ACL (Anti-Corruption Layer) para:
- Traduzir eventos do User Context para seu próprio modelo
- Proteger seu domínio de mudanças externas
- Manter independência arquitetural