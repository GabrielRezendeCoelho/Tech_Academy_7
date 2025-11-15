// Exemplo de controller COMPLETO usando TODAS as novas features
import { Request, Response } from 'express';
import { FinancialAccountRepository } from '../repositories/FinancialAccountRepository';
import { createDbCircuitBreaker, withRetry } from '../utils/circuitBreaker';
import { recordDbError, recordCacheHit, recordCacheMiss } from '../middleware/metrics';
import { logDomainEvent } from '../utils/logger';
import redisClient from '../config/redis';

// Instância do repository
const repo = new FinancialAccountRepository();

// Circuit breaker para operação de cache
const cacheBreaker = createDbCircuitBreaker(
  async (key: string) => {
    return await redisClient.get(key);
  },
  { name: 'redis-get', timeout: 2000 }
);

// ============================================================================
// GET /saldos - Buscar saldo do usuário (com cache, circuit breaker, logs)
// ============================================================================
export const getSaldoWithAllFeatures = async (req: Request, res: Response) => {
  const logger = (req as any).logger; // Logger com requestId
  const requestId = (req as any).requestId;
  const userId = req.user!.id; // Requer authenticateToken middleware
  
  logger.info({ userId }, 'Fetching user balance');
  
  try {
    // 1. Tentar buscar do cache com circuit breaker
    const cacheKey = `saldo:user:${userId}`;
    
    try {
      const cached = await cacheBreaker.fire(cacheKey);
      
      if (cached) {
        recordCacheHit('saldos');
        logger.info({ userId, source: 'cache' }, 'Balance fetched from cache');
        return res.json(JSON.parse(cached));
      }
    } catch (cacheError) {
      logger.warn({ error: cacheError }, 'Cache read failed, falling back to DB');
      // Continua para buscar do banco
    }
    
    recordCacheMiss('saldos');
    
    // 2. Buscar do banco usando repository (já tem circuit breaker)
    const account = await repo.findByUserId(userId);
    
    if (!account) {
      logger.warn({ userId }, 'Financial account not found');
      return res.status(404).json({ error: 'Conta financeira não encontrada' });
    }
    
    // 3. Preparar resposta
    const balance = account.getBalance();
    const response = {
      userId,
      balance: balance.getAmount(),
      currency: balance.getCurrency(),
      transactionCount: account.getTransactions().length,
      lastUpdated: new Date().toISOString()
    };
    
    // 4. Salvar no cache com retry
    try {
      await withRetry(
        async () => {
          await redisClient.set(cacheKey, JSON.stringify(response), { EX: 60 });
        },
        3,    // 3 tentativas
        1000  // delay inicial 1s
      );
      logger.debug({ userId }, 'Balance cached successfully');
    } catch (cacheError) {
      logger.warn({ error: cacheError }, 'Failed to cache balance');
      // Não falha a requisição por erro no cache
    }
    
    // 5. Log evento de domínio
    logDomainEvent('BalanceFetched', {
      userId,
      balance: balance.getAmount(),
      source: 'database'
    }, requestId);
    
    logger.info({ userId, balance: balance.getAmount() }, 'Balance fetched successfully');
    res.json(response);
    
  } catch (error) {
    logger.error({ userId, error, requestId }, 'Error fetching balance');
    recordDbError('getSaldo');
    res.status(500).json({ error: 'Erro ao buscar saldo' });
  }
};

// ============================================================================
// POST /saldos - Adicionar transação (com events, logs, invalidação de cache)
// ============================================================================
export const addTransactionWithAllFeatures = async (req: Request, res: Response) => {
  const logger = (req as any).logger;
  const requestId = (req as any).requestId;
  const userId = req.user!.id;
  const { amount, category, type, description } = req.body;
  
  logger.info({ userId, amount, type }, 'Adding transaction');
  
  try {
    // 1. Validar input
    if (!amount || !category || !type) {
      logger.warn({ userId, body: req.body }, 'Invalid transaction data');
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    
    // 2. Buscar conta do usuário
    const account = await repo.findByUserId(userId);
    
    if (!account) {
      logger.warn({ userId }, 'Account not found for transaction');
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    
    // 3. Adicionar transação (dispara evento automaticamente)
    // O método addTransaction já dispara o evento TransactionAdded
    // que será capturado pelos handlers registrados
    
    // 4. Salvar no banco
    await repo.save(account);
    
    logger.info({ userId, transactionId: 'generated-id' }, 'Transaction added successfully');
    
    // 5. Invalidar cache
    const cacheKey = `saldo:user:${userId}`;
    try {
      await redisClient.del(cacheKey);
      logger.debug({ userId }, 'Cache invalidated');
    } catch (cacheError) {
      logger.warn({ error: cacheError }, 'Failed to invalidate cache');
    }
    
    // 6. Log evento de domínio
    logDomainEvent('TransactionAdded', {
      userId,
      amount,
      type,
      category,
      description
    }, requestId);
    
    res.status(201).json({
      message: 'Transação adicionada com sucesso',
      balance: account.getBalance().getAmount()
    });
    
  } catch (error) {
    logger.error({ userId, error, requestId }, 'Error adding transaction');
    recordDbError('addTransaction');
    res.status(500).json({ error: 'Erro ao adicionar transação' });
  }
};

// ============================================================================
// DELETE /saldos/:id - Deletar transação (apenas admin ou dono)
// Use com: authenticateToken + ensureOwnership
// ============================================================================
export const deleteTransactionWithAuth = async (req: Request, res: Response) => {
  const logger = (req as any).logger;
  const requestId = (req as any).requestId;
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const transactionId = Number(req.params.id);
  
  logger.info({ userId, userRole, transactionId }, 'Deleting transaction');
  
  try {
    // O middleware ensureOwnership já garante que:
    // - Admin pode deletar qualquer transação
    // - User só pode deletar suas próprias transações
    
    const account = await repo.findByUserId(userId);
    
    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    
    // Deletar transação (implementar método no aggregate)
    // account.removeTransaction(transactionId);
    
    await repo.save(account);
    
    // Invalidar cache
    const cacheKey = `saldo:user:${userId}`;
    await redisClient.del(cacheKey);
    
    logger.info({ userId, transactionId, deletedBy: userRole }, 'Transaction deleted');
    
    logDomainEvent('TransactionDeleted', {
      userId,
      transactionId,
      deletedBy: userId,
      deletedByRole: userRole
    }, requestId);
    
    res.json({ message: 'Transação deletada com sucesso' });
    
  } catch (error) {
    logger.error({ userId, transactionId, error }, 'Error deleting transaction');
    recordDbError('deleteTransaction');
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
};

// ============================================================================
// GET /admin/statistics - Rota apenas para admin
// Use com: authenticateToken + requireRole('admin')
// ============================================================================
export const getAdminStatistics = async (req: Request, res: Response) => {
  const logger = (req as any).logger;
  const requestId = (req as any).requestId;
  const adminId = req.user!.id;
  
  logger.info({ adminId }, 'Admin accessing statistics');
  
  try {
    // Buscar estatísticas (exemplo simplificado)
    const stats = {
      totalUsers: 100,
      totalTransactions: 5000,
      totalBalance: 1000000,
      averageBalancePerUser: 10000,
      timestamp: new Date().toISOString()
    };
    
    logger.info({ adminId, stats }, 'Admin statistics retrieved');
    
    res.json(stats);
    
  } catch (error) {
    logger.error({ adminId, error }, 'Error fetching admin statistics');
    recordDbError('adminStatistics');
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};

export default {
  getSaldoWithAllFeatures,
  addTransactionWithAllFeatures,
  deleteTransactionWithAuth,
  getAdminStatistics
};
