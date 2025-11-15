import { FinancialAccount } from '../domain/financial/FinancialAccount';
import { IFinancialAccountRepository } from '../domain/financial/repositories/IFinancialAccountRepository';
import FinancialAccountModel from '../models/saldoModel';
import { Money } from '../domain/financial/Money';
import { Transaction } from '../domain/financial/Transaction';
import { Category } from '../domain/financial/Category';
import { createDbCircuitBreaker } from '../utils/circuitBreaker';
import { logger } from '../utils/logger';
import { recordDbError } from '../middleware/metrics';

// Implementação concreta do Repository Pattern
export class FinancialAccountRepository implements IFinancialAccountRepository {
  // Circuit breakers para operações de banco
  private findByIdBreaker;
  private findByUserIdBreaker;
  private saveBreaker;
  private deleteBreaker;

  constructor() {
    // Cria circuit breakers para cada operação
    this.findByIdBreaker = createDbCircuitBreaker(
      this._findByIdInternal.bind(this),
      { name: 'findFinancialAccountById', timeout: 5000 }
    );

    this.findByUserIdBreaker = createDbCircuitBreaker(
      this._findByUserIdInternal.bind(this),
      { name: 'findFinancialAccountByUserId', timeout: 5000 }
    );

    this.saveBreaker = createDbCircuitBreaker(
      this._saveInternal.bind(this),
      { name: 'saveFinancialAccount', timeout: 10000 }
    );

    this.deleteBreaker = createDbCircuitBreaker(
      this._deleteInternal.bind(this),
      { name: 'deleteFinancialAccount', timeout: 5000 }
    );
  }

  async findById(id: number): Promise<FinancialAccount | null> {
    try {
      return await this.findByIdBreaker.fire(id);
    } catch (error) {
      logger.error({ id, error }, 'Error finding financial account by id');
      recordDbError('findById');
      throw error;
    }
  }

  async findByUserId(userId: number): Promise<FinancialAccount | null> {
    try {
      return await this.findByUserIdBreaker.fire(userId);
    } catch (error) {
      logger.error({ userId, error }, 'Error finding financial account by user id');
      recordDbError('findByUserId');
      throw error;
    }
  }

  async save(account: FinancialAccount): Promise<void> {
    try {
      await this.saveBreaker.fire(account);
    } catch (error) {
      logger.error({ accountId: account.getId(), error }, 'Error saving financial account');
      recordDbError('save');
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.deleteBreaker.fire(id);
    } catch (error) {
      logger.error({ id, error }, 'Error deleting financial account');
      recordDbError('delete');
      throw error;
    }
  }

  // Métodos internos que executam as operações reais
  private async _findByIdInternal(id: number): Promise<FinancialAccount | null> {
    const model = await FinancialAccountModel.findByPk(id);
    if (!model) return null;
    return this.toDomain(model);
  }

  private async _findByUserIdInternal(userId: number): Promise<FinancialAccount | null> {
    const models = await FinancialAccountModel.findAll({ where: { userId } });
    if (models.length === 0) return null;
    
    // Para simplificar, retorna o primeiro (assumindo 1 conta por usuário)
    return this.toDomain(models[0]);
  }

  private async _saveInternal(account: FinancialAccount): Promise<void> {
    const accountData = this.toPersistence(account);
    
    // Verifica se já existe
    const existing = await FinancialAccountModel.findByPk(account.getId());
    
    if (existing) {
      await existing.update(accountData);
      logger.info({ accountId: account.getId() }, 'Financial account updated');
    } else {
      await FinancialAccountModel.create(accountData);
      logger.info({ accountId: account.getId() }, 'Financial account created');
    }
  }

  private async _deleteInternal(id: number): Promise<void> {
    const model = await FinancialAccountModel.findByPk(id);
    if (model) {
      await model.destroy();
      logger.info({ accountId: id }, 'Financial account deleted');
    }
  }

  // Conversão de modelo Sequelize para entidade de domínio
  private toDomain(model: any): FinancialAccount {
    // Usando o método estático create() pois o construtor é privado
    const account = FinancialAccount.create(
      model.id,
      Money.create(model.balance || 0)
    );
    
    return account;
  }

  // Conversão de entidade de domínio para modelo Sequelize
  private toPersistence(account: FinancialAccount): any {
    return {
      id: account.getId(),
      balance: account.getBalance().getAmount(),
      updatedAt: new Date(),
    };
  }
}
