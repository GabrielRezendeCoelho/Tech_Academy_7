# DDD - Entities, Value Objects e Aggregates

**Data:** 2025-11-20  
**Versão:** 1.0  
**Projeto:** Tech Academy 7 - Sistema Financeiro Kash

---

## 1. Introdução

Este documento lista todos os **Entities**, **Value Objects** e **Aggregates** do sistema, implementados seguindo princípios de Domain-Driven Design (DDD).

A estrutura do domínio está organizada em **Bounded Contexts**:
- **Financial Context:** Gerencia saldo, transações e categorias
- **User Context:** Gerencia usuários e autenticação

---

## 2. Financial Bounded Context

### 2.1 Aggregates

#### **FinancialAccount** (Aggregate Root)
**Arquivo:** `backend/src/domain/financial/FinancialAccount.ts`

**Responsabilidade:** Gerencia saldo e transações de forma consistente

**Propriedades:**
```typescript
id: string (UUID)
userId: string
balance: Money (Value Object)
transactions: Transaction[] (Entities)
createdAt: Date
updatedAt: Date
```

**Invariantes (Regras de Negócio):**
- Saldo nunca pode ser negativo
- Todas as transações devem estar associadas ao userId correto
- Transações são imutáveis após criadas

**Métodos:**
- `addTransaction(transaction: Transaction): void`
- `getBalance(): Money`
- `getTransactionHistory(startDate: Date, endDate: Date): Transaction[]`
- `calculateTotalIncome(): Money`
- `calculateTotalExpenses(): Money`
- `validateTransaction(transaction: Transaction): void`

**Domain Events:**
- `TransactionAdded` - Publicado quando nova transação é criada
- `BalanceUpdated` - Publicado quando saldo muda
- `ExcessiveSpendingDetected` - Publicado quando gastos excedem limite

---

### 2.2 Entities

#### **Transaction**
**Arquivo:** `backend/src/domain/financial/Transaction.ts`

**Responsabilidade:** Representa uma transação financeira

**Propriedades:**
```typescript
id: string (UUID)
amount: Money (Value Object)
category: Category (Entity)
date: Date
description: string (opcional)
origin: TransactionOrigin (enum: 'income' | 'expense' | 'transfer')
userId: string
createdAt: Date
```

**Identidade:** UUID gerado automaticamente

**Regras:**
- Transação é imutável após criada
- `amount` deve ser sempre positivo (sinal é definido por `origin`)
- `date` não pode ser futura
- `category` é obrigatória

**Métodos:**
- `isIncome(): boolean`
- `isExpense(): boolean`
- `getFormattedAmount(): string` (ex: "R$ 1.234,56")

---

#### **Category**
**Arquivo:** `backend/src/domain/financial/Category.ts`

**Responsabilidade:** Categorização de transações (ex: alimentação, transporte, salário)

**Propriedades:**
```typescript
id: string (UUID)
name: string
type: CategoryType (enum: 'income' | 'expense')
icon: string (opcional)
color: string (opcional, hex color)
userId: string
createdAt: Date
```

**Identidade:** UUID gerado automaticamente

**Regras:**
- Nome deve ser único por usuário
- Tipo ('income' ou 'expense') define se categoria é para receitas ou despesas
- Nome deve ter entre 2 e 50 caracteres

**Métodos:**
- `isIncomeCategory(): boolean`
- `isExpenseCategory(): boolean`

---

### 2.3 Value Objects

#### **Money**
**Arquivo:** `backend/src/domain/financial/Money.ts`

**Responsabilidade:** Encapsula valor monetário com validações

**Propriedades:**
```typescript
amount: number (valor em centavos, ex: 12345 = R$ 123,45)
currency: string (padrão: 'BRL')
```

**Características:**
- **Imutável:** Uma vez criado, não pode ser modificado
- **Sem identidade:** Dois Money com mesmo valor são iguais
- **Auto-validação:** Valida valor no construtor

**Regras:**
- `amount` deve ser >= 0 (não permite valores negativos)
- `amount` armazenado em centavos para evitar erros de precisão float
- `currency` padrão é 'BRL'

**Métodos:**
```typescript
constructor(amount: number, currency = 'BRL')
add(other: Money): Money
subtract(other: Money): Money
multiply(factor: number): Money
divide(divisor: number): Money
equals(other: Money): boolean
isZero(): boolean
isPositive(): boolean
toFloat(): number // Retorna valor em reais (ex: 123.45)
format(): string // Retorna formatado (ex: "R$ 123,45")
```

**Exemplo de uso:**
```typescript
const salary = new Money(250000); // R$ 2.500,00
const bonus = new Money(50000);   // R$ 500,00
const total = salary.add(bonus);  // R$ 3.000,00

console.log(total.format()); // "R$ 3.000,00"
```

---

### 2.4 Domain Services

#### **FinancialService**
**Arquivo:** `backend/src/domain/financial/services/FinancialService.ts`

**Responsabilidade:** Orquestra operações complexas entre agregados

**Operações:**
- `createTransaction(userId, amount, categoryId, date, origin)` - Cria transação e atualiza saldo
- `calculateBalance(userId)` - Calcula saldo total do usuário
- `detectExcessiveSpending(userId, period)` - Analisa gastos e detecta anomalias
- `generateMonthlyReport(userId, month, year)` - Gera relatório mensal
- `transferBetweenAccounts(fromUserId, toUserId, amount)` - Transferência entre usuários

**Domain Events Publicados:**
- `TransactionAdded`
- `ExcessiveSpendingDetected`
- `BalanceUpdated`

---

## 3. User Bounded Context

### 3.1 Aggregates

#### **User** (Aggregate Root)
**Arquivo:** `backend/src/domain/user/User.ts`

**Responsabilidade:** Gerencia dados e autenticação do usuário

**Propriedades:**
```typescript
id: string (UUID)
name: string
email: Email (Value Object)
passwordHash: string (bcrypt)
cpf: string
role: UserRole (enum: 'user' | 'admin')
createdAt: Date
updatedAt: Date
```

**Invariantes:**
- Email deve ser válido e único
- Senha deve ter mínimo 6 caracteres (antes do hash)
- CPF deve ser válido (11 dígitos)
- Role padrão é 'user'

**Métodos:**
- `validatePassword(plainPassword: string): Promise<boolean>` - Verifica senha com bcrypt
- `changePassword(newPassword: string): Promise<void>` - Altera senha com hash
- `isAdmin(): boolean` - Verifica se usuário é admin
- `generateJWT(): string` - Gera token JWT com payload { id, email, role }

**Domain Events:**
- `UserCreated` - Publicado quando usuário é registrado
- `UserPasswordChanged` - Publicado quando senha é alterada

---

### 3.2 Value Objects

#### **Email**
**Arquivo:** `backend/src/domain/user/Email.ts`

**Responsabilidade:** Validação de formato de e-mail

**Propriedades:**
```typescript
value: string (email normalizado em lowercase)
```

**Características:**
- **Imutável:** Não pode ser modificado após criação
- **Auto-validação:** Valida formato no construtor
- **Normalização:** Sempre armazena em lowercase

**Regras:**
- Formato válido de email (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Máximo 255 caracteres
- Unicidade garantida por constraint no banco

**Métodos:**
```typescript
constructor(value: string)
getValue(): string
getDomain(): string // Retorna parte após @ (ex: "gmail.com")
equals(other: Email): boolean
```

**Exemplo de uso:**
```typescript
const email = new Email('Lucas@GMAIL.com'); 
console.log(email.getValue()); // "lucas@gmail.com" (normalized)
console.log(email.getDomain()); // "gmail.com"
```

---

## 4. Shared Kernel (Classes Base)

### 4.1 Entity (Abstract Base Class)
**Arquivo:** `backend/src/domain/shared/Entity.ts`

**Responsabilidade:** Classe base para todas as entidades do domínio

**Propriedades:**
```typescript
id: string (UUID)
createdAt: Date
updatedAt: Date
```

**Métodos:**
- `equals(other: Entity): boolean` - Compara identidade (id)
- `toJSON(): object` - Serialização para JSON

---

### 4.2 ValueObject (Abstract Base Class)
**Arquivo:** `backend/src/domain/shared/ValueObject.ts`

**Responsabilidade:** Classe base para todos os value objects

**Características:**
- Imutabilidade
- Igualdade por valor (não por referência)
- Sem identidade única

**Métodos abstratos:**
- `equals(other: ValueObject): boolean` - Comparação por valor
- `toJSON(): object` - Serialização

---

### 4.3 AggregateRoot (Abstract Base Class)
**Arquivo:** `backend/src/domain/shared/AggregateRoot.ts`

**Responsabilidade:** Classe base para aggregate roots que publicam domain events

**Propriedades:**
```typescript
domainEvents: DomainEvent[] (eventos pendentes)
```

**Métodos:**
- `addDomainEvent(event: DomainEvent): void` - Adiciona evento
- `clearDomainEvents(): void` - Limpa eventos
- `publishDomainEvents(): Promise<void>` - Publica eventos via EventBus

---

## 5. Repositories (Interfaces - Ports)

### **IFinancialAccountRepository**
**Arquivo:** `backend/src/domain/financial/repositories/IFinancialAccountRepository.ts`

**Responsabilidade:** Interface para persistência de FinancialAccount

**Métodos:**
```typescript
findById(id: string): Promise<FinancialAccount | null>
findByUserId(userId: string): Promise<FinancialAccount>
save(account: FinancialAccount): Promise<void>
```

**Implementação:** Sequelize ORM (camada de infraestrutura)

---

## 6. Diagrama de Relacionamentos

```
┌─────────────────────────────────────────────────────────────┐
│                    FINANCIAL CONTEXT                         │
│                                                              │
│  ┌──────────────────────┐                                   │
│  │  FinancialAccount    │ (Aggregate Root)                  │
│  │  ─────────────────   │                                   │
│  │  + id: string        │                                   │
│  │  + userId: string    │                                   │
│  │  + balance: Money    │───────┐                           │
│  │  + transactions[]    │       │                           │
│  └──────────┬───────────┘       │                           │
│             │                   │                           │
│             │ contains          │ uses                      │
│             │                   │                           │
│  ┌──────────▼───────────┐  ┌────▼──────────┐               │
│  │    Transaction       │  │     Money     │ (Value Object)│
│  │  (Entity)            │  │ (Value Object)│               │
│  │  ───────────────     │  │ ──────────────│               │
│  │  + id: string        │  │ + amount: int │               │
│  │  + amount: Money     │──┤ + currency    │               │
│  │  + category: Category│  └───────────────┘               │
│  │  + date: Date        │                                   │
│  │  + origin: enum      │                                   │
│  └──────────┬───────────┘                                   │
│             │                                                │
│             │ references                                     │
│             │                                                │
│  ┌──────────▼───────────┐                                   │
│  │      Category        │ (Entity)                          │
│  │  ─────────────────   │                                   │
│  │  + id: string        │                                   │
│  │  + name: string      │                                   │
│  │  + type: enum        │                                   │
│  └──────────────────────┘                                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      USER CONTEXT                             │
│                                                               │
│  ┌──────────────────────┐                                    │
│  │        User          │ (Aggregate Root)                   │
│  │  ─────────────────   │                                    │
│  │  + id: string        │                                    │
│  │  + name: string      │                                    │
│  │  + email: Email      │──────┐                             │
│  │  + passwordHash      │      │                             │
│  │  + cpf: string       │      │ uses                        │
│  │  + role: enum        │      │                             │
│  └──────────────────────┘  ┌───▼───────────┐                │
│                            │     Email     │ (Value Object) │
│                            │ (Value Object)│                │
│                            │ ──────────────│                │
│                            │ + value: str  │                │
│                            └───────────────┘                │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 7. Checklist de Implementação DDD

### Entities
- ✅ FinancialAccount (Aggregate Root)
- ✅ Transaction (Entity)
- ✅ Category (Entity)
- ✅ User (Aggregate Root)

### Value Objects
- ✅ Money (Financial Context)
- ✅ Email (User Context)

### Aggregates
- ✅ FinancialAccount com regras de consistência
- ✅ User com validações de integridade

### Domain Services
- ✅ FinancialService (orquestração de transações)

### Repositories (Interfaces)
- ✅ IFinancialAccountRepository

### Domain Events
- ✅ TransactionAdded
- ✅ BalanceUpdated
- ✅ ExcessiveSpendingDetected
- ✅ UserCreated

### Shared Kernel
- ✅ Entity (base class)
- ✅ ValueObject (base class)
- ✅ AggregateRoot (base class)

---

## 8. Regras de Ouro DDD Aplicadas

1. **Aggregates protegem invariantes:**
   - FinancialAccount garante que saldo nunca é negativo
   - User garante que email é único e válido

2. **Value Objects são imutáveis:**
   - Money não pode ser modificado após criação
   - Email sempre normalizado (lowercase)

3. **Entities têm identidade:**
   - Transaction, Category e User usam UUID
   - Igualdade por id, não por atributos

4. **Repositórios trabalham com Aggregates:**
   - IFinancialAccountRepository persiste aggregate completo (com transactions)

5. **Domain Events para comunicação:**
   - TransactionAdded notifica outros contextos via EventBus
   - Pub/Sub com Redis para desacoplamento

6. **Linguagem Ubíqua:**
   - Termos do domínio financeiro: Transaction, Balance, Category, Money
   - Evitado jargões técnicos no domínio

---

## 9. Próximos Passos (Melhorias Futuras)

### Value Objects Adicionais
- ⚠️ **CPF** (Value Object) - Validação completa com dígitos verificadores
- ⚠️ **TransactionDescription** (Value Object) - Max 500 caracteres, sanitização
- ⚠️ **CategoryName** (Value Object) - Validação de caracteres especiais

### Domain Services
- ⚠️ **ReportService** - Geração de relatórios mensais/anuais
- ⚠️ **BudgetService** - Controle de orçamento por categoria

### Specifications Pattern
- ⚠️ **TransactionSpecification** - Regras de filtragem complexas (por data, categoria, valor)

### Domain Events
- ⚠️ **MonthlyReportGenerated**
- ⚠️ **BudgetExceeded**

---

**Última atualização:** 2025-11-20  
**Responsável:** Tech Academy 7 Team
