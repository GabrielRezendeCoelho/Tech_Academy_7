"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialService = void 0;
const FinancialAccount_1 = require("../FinancialAccount");
const Money_1 = require("../Money");
class FinancialService {
    constructor(financialAccountRepository) {
        this.financialAccountRepository = financialAccountRepository;
    }
    async addTransaction(userId, transaction) {
        let account = await this.financialAccountRepository.findByUserId(userId);
        if (!account) {
            account = FinancialAccount_1.FinancialAccount.create(userId);
        }
        account.addTransaction(transaction);
        // Business rule: Check for excessive spending
        if (transaction.isExpense()) {
            const monthlyExpenseLimit = Money_1.Money.create(5000); // R$ 5000 limit
            account.checkAndNotifyExcessiveSpending(monthlyExpenseLimit);
        }
        await this.financialAccountRepository.save(account);
    }
    async getBalance(userId) {
        const account = await this.financialAccountRepository.findByUserId(userId);
        if (!account) {
            return Money_1.Money.create(0);
        }
        return account.getBalance();
    }
    async checkExcessiveSpending(userId, threshold) {
        const account = await this.financialAccountRepository.findByUserId(userId);
        if (!account) {
            return false;
        }
        return account.hasExcessiveSpending(threshold);
    }
}
exports.FinancialService = FinancialService;
