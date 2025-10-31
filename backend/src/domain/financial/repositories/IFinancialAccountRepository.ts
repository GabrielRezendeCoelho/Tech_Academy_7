import { FinancialAccount } from '../FinancialAccount';

export interface IFinancialAccountRepository {
  findById(id: number): Promise<FinancialAccount | null>;
  findByUserId(userId: number): Promise<FinancialAccount | null>;
  save(account: FinancialAccount): Promise<void>;
  delete(id: number): Promise<void>;
}