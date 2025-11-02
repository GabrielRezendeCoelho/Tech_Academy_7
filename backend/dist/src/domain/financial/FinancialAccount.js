"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialAccount = void 0;
const AggregateRoot_1 = require("../shared/AggregateRoot");
const Money_1 = require("./Money");
class FinancialAccount extends AggregateRoot_1.AggregateRoot {
    constructor(id, initialBalance) {
        super(id);
        this._transactions = [];
        this._balance = initialBalance;
    }
    static create(id, initialBalance) {
        const balance = initialBalance || Money_1.Money.create(0);
        return new FinancialAccount(id, balance);
    }
    addTransaction(transaction) {
        this._transactions.push(transaction);
        if (transaction.isIncome()) {
            this._balance = this._balance.add(transaction.getAmount());
        }
        else {
            this._balance = this._balance.subtract(transaction.getAmount());
        }
        this.addDomainEvent({
            type: 'TransactionAdded',
            aggregateId: this.getId(),
            transaction: transaction,
            newBalance: this._balance
        });
    }
    getBalance() {
        return this._balance;
    }
    getTransactions() {
        return [...this._transactions];
    }
    getTotalExpenses() {
        const expenses = this._transactions.filter(t => t.isExpense());
        return expenses.reduce((total, transaction) => total.add(transaction.getAmount()), Money_1.Money.create(0));
    }
    getTotalIncome() {
        const income = this._transactions.filter(t => t.isIncome());
        return income.reduce((total, transaction) => total.add(transaction.getAmount()), Money_1.Money.create(0));
    }
    hasExcessiveSpending(threshold) {
        const totalExpenses = this.getTotalExpenses();
        return totalExpenses.getAmount() > threshold.getAmount();
    }
    checkAndNotifyExcessiveSpending(threshold) {
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
exports.FinancialAccount = FinancialAccount;
