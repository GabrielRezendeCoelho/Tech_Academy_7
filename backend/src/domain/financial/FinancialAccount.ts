import { AggregateRoot } from '../shared/AggregateRoot';
import { Money } from './Money';
import { Transaction } from './Transaction';

export class FinancialAccount extends AggregateRoot<number> {
  private _balance: Money;
  private _transactions: Transaction[] = [];

  private constructor(id: number, initialBalance: Money) {
    super(id);
    this._balance = initialBalance;
  }

  public static create(id: number, initialBalance?: Money): FinancialAccount {
    const balance = initialBalance || Money.create(0);
    return new FinancialAccount(id, balance);
  }

  public addTransaction(transaction: Transaction): void {
    this._transactions.push(transaction);
    
    if (transaction.isIncome()) {
      this._balance = this._balance.add(transaction.getAmount());
    } else {
      this._balance = this._balance.subtract(transaction.getAmount());
    }

    this.addDomainEvent({
      type: 'TransactionAdded',
      aggregateId: this.getId(),
      transaction: transaction,
      newBalance: this._balance
    });
  }

  public getBalance(): Money {
    return this._balance;
  }

  public getTransactions(): Transaction[] {
    return [...this._transactions];
  }

  public getTotalExpenses(): Money {
    const expenses = this._transactions.filter(t => t.isExpense());
    return expenses.reduce(
      (total, transaction) => total.add(transaction.getAmount()),
      Money.create(0)
    );
  }

  public getTotalIncome(): Money {
    const income = this._transactions.filter(t => t.isIncome());
    return income.reduce(
      (total, transaction) => total.add(transaction.getAmount()),
      Money.create(0)
    );
  }

  public hasExcessiveSpending(threshold: Money): boolean {
    const totalExpenses = this.getTotalExpenses();
    return totalExpenses.getAmount() > threshold.getAmount();
  }

  public checkAndNotifyExcessiveSpending(threshold: Money): boolean {
    const totalExpenses = this.getTotalExpenses();
    const isExcessive = totalExpenses.getAmount() > threshold.getAmount();
    
    if (isExcessive) {
      this.addDomainEvent({
        type: 'ExcessiveSpendingDetected',
        aggregateId: this.getId(),
        currentExpenses: totalExpenses.getAmount(),
        limit: threshold.getAmount()
      });
    }
    
    return isExcessive;
  }
}