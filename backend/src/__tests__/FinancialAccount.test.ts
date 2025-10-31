import { FinancialAccount } from '../../domain/financial/FinancialAccount';
import { Transaction } from '../../domain/financial/Transaction';
import { Money } from '../../domain/financial/Money';
import { Category } from '../../domain/financial/Category';

describe('FinancialAccount Aggregate', () => {
  let account: FinancialAccount;
  
  beforeEach(() => {
    account = FinancialAccount.create(1);
  });

  describe('creation', () => {
    it('should create account with zero balance', () => {
      const balance = account.getBalance();
      expect(balance.getAmount()).toBe(0);
    });

    it('should create account with initial balance', () => {
      const initialBalance = Money.create(1000);
      const accountWithBalance = FinancialAccount.create(1, initialBalance);
      expect(accountWithBalance.getBalance().getAmount()).toBe(1000);
    });
  });

  describe('transaction management', () => {
    it('should add income transaction and increase balance', () => {
      const category = Category.create('Salary');
      const money = Money.create(5000);
      const transaction = Transaction.create(1, money, category, 'INCOME', 'Monthly salary');
      
      account.addTransaction(transaction);
      
      expect(account.getBalance().getAmount()).toBe(5000);
      expect(account.getTransactions()).toHaveLength(1);
    });

    it('should add expense transaction and decrease balance', () => {
      // First add some income
      const incomeCategory = Category.create('Salary');
      const incomeMoney = Money.create(5000);
      const incomeTransaction = Transaction.create(1, incomeMoney, incomeCategory, 'INCOME');
      account.addTransaction(incomeTransaction);

      // Then add expense
      const expenseCategory = Category.create('Food');
      const expenseMoney = Money.create(200);
      const expenseTransaction = Transaction.create(2, expenseMoney, expenseCategory, 'EXPENSE', 'Groceries');
      
      account.addTransaction(expenseTransaction);
      
      expect(account.getBalance().getAmount()).toBe(4800);
      expect(account.getTransactions()).toHaveLength(2);
    });

    it('should throw error when expense exceeds balance', () => {
      const category = Category.create('Shopping');
      const money = Money.create(1000);
      const transaction = Transaction.create(1, money, category, 'EXPENSE');
      
      expect(() => account.addTransaction(transaction)).toThrow('Insufficient funds');
    });
  });

  describe('financial calculations', () => {
    beforeEach(() => {
      // Add some test data
      const salaryCategory = Category.create('Salary');
      const foodCategory = Category.create('Food');
      const transportCategory = Category.create('Transport');

      const salary = Transaction.create(1, Money.create(5000), salaryCategory, 'INCOME', 'Salary');
      const food = Transaction.create(2, Money.create(300), foodCategory, 'EXPENSE', 'Groceries');
      const transport = Transaction.create(3, Money.create(150), transportCategory, 'EXPENSE', 'Bus fare');

      account.addTransaction(salary);
      account.addTransaction(food);
      account.addTransaction(transport);
    });

    it('should calculate total expenses correctly', () => {
      const totalExpenses = account.getTotalExpenses();
      expect(totalExpenses.getAmount()).toBe(450);
    });

    it('should calculate total income correctly', () => {
      const totalIncome = account.getTotalIncome();
      expect(totalIncome.getAmount()).toBe(5000);
    });

    it('should detect excessive spending', () => {
      const threshold = Money.create(400);
      const isExcessive = account.hasExcessiveSpending(threshold);
      expect(isExcessive).toBe(true);
    });

    it('should not detect excessive spending when under threshold', () => {
      const threshold = Money.create(500);
      const isExcessive = account.hasExcessiveSpending(threshold);
      expect(isExcessive).toBe(false);
    });
  });

  describe('domain events', () => {
    it('should generate TransactionAdded event when adding transaction', () => {
      const category = Category.create('Salary');
      const money = Money.create(1000);
      const transaction = Transaction.create(1, money, category, 'INCOME');
      
      account.addTransaction(transaction);
      
      const events = account.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('TransactionAdded');
      expect(events[0].aggregateId).toBe(1);
    });

    it('should generate ExcessiveSpendingDetected event when threshold exceeded', () => {
      // Add initial income
      const incomeCategory = Category.create('Salary');
      const incomeMoney = Money.create(10000);
      const incomeTransaction = Transaction.create(1, incomeMoney, incomeCategory, 'INCOME');
      account.addTransaction(incomeTransaction);
      account.clearEvents(); // Clear the transaction added event

      // Add high expense to trigger excessive spending
      const expenseCategory = Category.create('Shopping');
      const expenseMoney = Money.create(6000);
      const expenseTransaction = Transaction.create(2, expenseMoney, expenseCategory, 'EXPENSE');
      
      const threshold = Money.create(5000);
      account.checkAndNotifyExcessiveSpending(threshold);
      
      const events = account.domainEvents;
      expect(events.some(event => event.type === 'ExcessiveSpendingDetected')).toBe(true);
    });
  });
});