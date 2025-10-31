import { FinancialAccount } from '../FinancialAccount';
import { Transaction } from '../Transaction';
import { Money } from '../Money';
import { IFinancialAccountRepository } from '../repositories/IFinancialAccountRepository';

export class FinancialService {
  constructor(
    private financialAccountRepository: IFinancialAccountRepository
  ) {}

  async addTransaction(
    userId: number, 
    transaction: Transaction
  ): Promise<void> {
    let account = await this.financialAccountRepository.findByUserId(userId);
    
    if (!account) {
      account = FinancialAccount.create(userId);
    }

    account.addTransaction(transaction);

    // Business rule: Check for excessive spending
    if (transaction.isExpense()) {
      const monthlyExpenseLimit = Money.create(5000); // R$ 5000 limit
      account.checkAndNotifyExcessiveSpending(monthlyExpenseLimit);
    }
    await this.financialAccountRepository.save(account);
  }

  async getBalance(userId: number): Promise<Money> {
    const account = await this.financialAccountRepository.findByUserId(userId);
    if (!account) {
      return Money.create(0);
    }
    return account.getBalance();
  }

  async checkExcessiveSpending(userId: number, threshold: Money): Promise<boolean> {
    const account = await this.financialAccountRepository.findByUserId(userId);
    if (!account) {
      return false;
    }
    return account.hasExcessiveSpending(threshold);
  }
}