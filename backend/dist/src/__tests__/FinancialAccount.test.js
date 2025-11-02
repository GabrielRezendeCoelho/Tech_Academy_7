"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FinancialAccount_1 = require("../../domain/financial/FinancialAccount");
const Transaction_1 = require("../../domain/financial/Transaction");
const Money_1 = require("../../domain/financial/Money");
const Category_1 = require("../../domain/financial/Category");
describe('FinancialAccount Aggregate', () => {
    let account;
    beforeEach(() => {
        account = FinancialAccount_1.FinancialAccount.create(1);
    });
    describe('creation', () => {
        it('should create account with zero balance', () => {
            const balance = account.getBalance();
            expect(balance.getAmount()).toBe(0);
        });
        it('should create account with initial balance', () => {
            const initialBalance = Money_1.Money.create(1000);
            const accountWithBalance = FinancialAccount_1.FinancialAccount.create(1, initialBalance);
            expect(accountWithBalance.getBalance().getAmount()).toBe(1000);
        });
    });
    describe('transaction management', () => {
        it('should add income transaction and increase balance', () => {
            const category = Category_1.Category.create('Salary');
            const money = Money_1.Money.create(5000);
            const transaction = Transaction_1.Transaction.create(1, money, category, 'INCOME', 'Monthly salary');
            account.addTransaction(transaction);
            expect(account.getBalance().getAmount()).toBe(5000);
            expect(account.getTransactions()).toHaveLength(1);
        });
        it('should add expense transaction and decrease balance', () => {
            // First add some income
            const incomeCategory = Category_1.Category.create('Salary');
            const incomeMoney = Money_1.Money.create(5000);
            const incomeTransaction = Transaction_1.Transaction.create(1, incomeMoney, incomeCategory, 'INCOME');
            account.addTransaction(incomeTransaction);
            // Then add expense
            const expenseCategory = Category_1.Category.create('Food');
            const expenseMoney = Money_1.Money.create(200);
            const expenseTransaction = Transaction_1.Transaction.create(2, expenseMoney, expenseCategory, 'EXPENSE', 'Groceries');
            account.addTransaction(expenseTransaction);
            expect(account.getBalance().getAmount()).toBe(4800);
            expect(account.getTransactions()).toHaveLength(2);
        });
        it('should throw error when expense exceeds balance', () => {
            const category = Category_1.Category.create('Shopping');
            const money = Money_1.Money.create(1000);
            const transaction = Transaction_1.Transaction.create(1, money, category, 'EXPENSE');
            expect(() => account.addTransaction(transaction)).toThrow('Insufficient funds');
        });
    });
    describe('financial calculations', () => {
        beforeEach(() => {
            // Add some test data
            const salaryCategory = Category_1.Category.create('Salary');
            const foodCategory = Category_1.Category.create('Food');
            const transportCategory = Category_1.Category.create('Transport');
            const salary = Transaction_1.Transaction.create(1, Money_1.Money.create(5000), salaryCategory, 'INCOME', 'Salary');
            const food = Transaction_1.Transaction.create(2, Money_1.Money.create(300), foodCategory, 'EXPENSE', 'Groceries');
            const transport = Transaction_1.Transaction.create(3, Money_1.Money.create(150), transportCategory, 'EXPENSE', 'Bus fare');
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
            const threshold = Money_1.Money.create(400);
            const isExcessive = account.hasExcessiveSpending(threshold);
            expect(isExcessive).toBe(true);
        });
        it('should not detect excessive spending when under threshold', () => {
            const threshold = Money_1.Money.create(500);
            const isExcessive = account.hasExcessiveSpending(threshold);
            expect(isExcessive).toBe(false);
        });
    });
    describe('domain events', () => {
        it('should generate TransactionAdded event when adding transaction', () => {
            const category = Category_1.Category.create('Salary');
            const money = Money_1.Money.create(1000);
            const transaction = Transaction_1.Transaction.create(1, money, category, 'INCOME');
            account.addTransaction(transaction);
            const events = account.domainEvents;
            expect(events).toHaveLength(1);
            expect(events[0].type).toBe('TransactionAdded');
            expect(events[0].aggregateId).toBe(1);
        });
        it('should generate ExcessiveSpendingDetected event when threshold exceeded', () => {
            // Add initial income
            const incomeCategory = Category_1.Category.create('Salary');
            const incomeMoney = Money_1.Money.create(10000);
            const incomeTransaction = Transaction_1.Transaction.create(1, incomeMoney, incomeCategory, 'INCOME');
            account.addTransaction(incomeTransaction);
            account.clearEvents(); // Clear the transaction added event
            // Add high expense to trigger excessive spending
            const expenseCategory = Category_1.Category.create('Shopping');
            const expenseMoney = Money_1.Money.create(6000);
            const expenseTransaction = Transaction_1.Transaction.create(2, expenseMoney, expenseCategory, 'EXPENSE');
            const threshold = Money_1.Money.create(5000);
            account.checkAndNotifyExcessiveSpending(threshold);
            const events = account.domainEvents;
            expect(events.some(event => event.type === 'ExcessiveSpendingDetected')).toBe(true);
        });
    });
});
