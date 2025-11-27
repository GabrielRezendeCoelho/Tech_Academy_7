# Domain-Driven Design (DDD) Implementation

## Visão Geral

Este projeto implementa os princípios de Domain-Driven Design (DDD) para criar uma arquitetura robusta e bem estruturada para o aplicativo Kash.

## Estrutura DDD

### 1. Bounded Contexts (Contextos Delimitados)

#### Financial Management Context
- **Propósito**: Gerenciar transações financeiras, saldos e categorias
- **Aggregate Root**: `FinancialAccount`
- **Entities**: `Transaction`
- **Value Objects**: `Money`, `Category`

#### User Management Context
- **Propósito**: Autenticação e gerenciamento de usuários
- **Aggregate Root**: `User`
- **Value Objects**: `Email`

### 2. Building Blocks

#### Entities
```typescript
// Classe base para todas as entidades
export abstract class Entity<T> {
  protected readonly _id: T;
  // Métodos de igualdade e identificação
}
```

#### Value Objects
```typescript
// Classe base para objetos de valor
export abstract class ValueObject<T> {
  protected readonly props: T;
  // Métodos de comparação e imutabilidade
}
```

#### Aggregate Roots
```typescript
// Classe base para raízes de agregado
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: any[] = [];
  // Gerenciamento de eventos de domínio
}
```

### 3. Domain Services

#### FinancialService
Implementa regras de negócio complexas que não pertencem a uma única entidade:
- Verificação de gastos excessivos
- Cálculos financeiros agregados
- Validações de transações

### 4. Repository Pattern
```typescript
export interface IFinancialAccountRepository {
  findById(id: number): Promise<FinancialAccount | null>;
  findByUserId(userId: number): Promise<FinancialAccount | null>;
  save(account: FinancialAccount): Promise<void>;
  delete(id: number): Promise<void>;
}
```

### 5. Domain Events

O sistema utiliza eventos de domínio para comunicação entre bounded contexts:

- `UserCreated`: Quando um usuário é criado
- `TransactionAdded`: Quando uma transação é adicionada
- `ExcessiveSpendingDetected`: Quando gastos excedem um limite

### 6. Business Rules (Regras de Negócio)

#### Money Value Object
- Não permite valores negativos
- Operações apenas entre moedas da mesma currency
- Proteção contra operações que resultariam em fundos insuficientes

#### Financial Account Aggregate
- Controla todas as transações de um usuário
- Mantém o saldo atualizado automaticamente
- Detecta gastos excessivos baseado em thresholds configuráveis

#### User Aggregate
- Valida formato de email
- Gerencia estado ativo/inativo
- Controla mudanças de informações pessoais

### 7. Anti-Corruption Layer (ACL)

Implementado para proteger o domínio financeiro de mudanças em sistemas externos:
- Tradução de eventos entre contexts
- Isolamento de mudanças externas
- Manutenção da integridade do modelo de domínio

## Vantagens da Implementação DDD

1. **Separação Clara de Responsabilidades**: Cada bounded context tem uma responsabilidade específica
2. **Modelos Ricos**: Entities e Value Objects encapsulam comportamento além de dados
3. **Testabilidade**: Lógica de negócio isolada e facilmente testável
4. **Evolução Controlada**: Mudanças são isoladas dentro dos contextos
5. **Linguagem Ubíqua**: Código reflete a linguagem do domínio

## Como Usar

### Criando uma Nova Transação
```typescript
const category = Category.create('Food', 'Restaurant expenses');
const amount = Money.create(45.50);
const transaction = Transaction.create(1, amount, category, 'EXPENSE', 'Lunch');

const account = await financialAccountRepository.findByUserId(userId);
account.addTransaction(transaction);
await financialAccountRepository.save(account);
```

### Verificando Gastos Excessivos
```typescript
const financialService = new FinancialService(financialAccountRepository);
const threshold = Money.create(1000);
const hasExcessiveSpending = await financialService.checkExcessiveSpending(userId, threshold);
```

## Testes

Os testes são organizados por domínio e focam em:
- Comportamento das entities e value objects
- Regras de negócio dos aggregates
- Serviços de domínio
- Eventos de domínio

Execute os testes com:
```bash
npm test
```