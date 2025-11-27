import { DomainEvent, eventDispatcher } from '../shared/DomainEventDispatcher';
import { logger } from '../../utils/logger';
import { eventBus } from '../../utils/eventBus';

// Handler para evento de transação adicionada
export const handleTransactionAdded = async (event: DomainEvent): Promise<void> => {
  logger.info({
    eventName: event.eventName,
    accountId: event.aggregateId,
    transaction: event.data,
  }, 'Handling TransactionAdded event');

  // ✅ PUBLICAR NO REDIS PUB/SUB para comunicação distribuída
  try {
    await eventBus.publish('TransactionAdded', {
      aggregateId: event.aggregateId,
      amount: event.data.amount,
      type: event.data.type,
      description: event.data.description,
      categoryId: event.data.categoryId
    }, {
      userId: event.data.userId,
      correlationId: `${event.eventName}-${event.aggregateId}-${Date.now()}`,
      timestamp: event.occurredOn
    });
    logger.info({ eventName: event.eventName }, '✅ Event published to Redis Pub/Sub');
  } catch (error) {
    logger.error({ error, eventName: event.eventName }, 'Failed to publish event to Redis');
  }

  // Aqui você pode:
  // - Enviar notificação para o usuário
  // - Atualizar cache
  // - Enviar para fila de processamento assíncrono
  // - Registrar em sistema de auditoria
  
  // Exemplo: verificar se é um gasto excessivo
  if (event.data.type === 'EXPENSE' && event.data.amount > 1000) {
    logger.warn({
      accountId: event.aggregateId,
      amount: event.data.amount,
    }, 'Large expense detected');
    
    // Aqui você poderia disparar outro evento ou notificação
  }
};

// Handler para evento de gastos excessivos detectados
export const handleExcessiveSpendingDetected = async (event: DomainEvent): Promise<void> => {
  logger.warn({
    eventName: event.eventName,
    accountId: event.aggregateId,
    totalExpenses: event.data.totalExpenses,
    threshold: event.data.threshold,
  }, 'Handling ExcessiveSpendingDetected event');

  // ✅ PUBLICAR NO REDIS PUB/SUB
  try {
    await eventBus.publish('ExcessiveSpendingDetected', {
      aggregateId: event.aggregateId,
      totalExpenses: event.data.totalExpenses,
      threshold: event.data.threshold,
      period: event.data.period
    }, {
      userId: event.data.userId,
      correlationId: `${event.eventName}-${event.aggregateId}-${Date.now()}`,
      severity: 'warning'
    });
    logger.warn({ eventName: event.eventName }, '⚠️ Alert published to Redis Pub/Sub');
  } catch (error) {
    logger.error({ error, eventName: event.eventName }, 'Failed to publish alert to Redis');
  }

  // Aqui você pode:
  // - Enviar email/SMS de alerta
  // - Criar notificação push
  // - Registrar em sistema de alertas
  // - Enviar para dashboard de monitoramento
};

// Handler para evento de saldo atualizado
export const handleBalanceUpdated = async (event: DomainEvent): Promise<void> => {
  logger.info({
    eventName: event.eventName,
    accountId: event.aggregateId,
    newBalance: event.data.newBalance,
    oldBalance: event.data.oldBalance,
  }, 'Handling BalanceUpdated event');

  // ✅ PUBLICAR NO REDIS PUB/SUB
  try {
    await eventBus.publish('BalanceUpdated', {
      aggregateId: event.aggregateId,
      newBalance: event.data.newBalance,
      oldBalance: event.data.oldBalance,
      difference: event.data.newBalance - event.data.oldBalance
    }, {
      userId: event.data.userId,
      correlationId: `${event.eventName}-${event.aggregateId}-${Date.now()}`
    });
    logger.info({ eventName: event.eventName }, '💰 Balance update published to Redis Pub/Sub');
  } catch (error) {
    logger.error({ error, eventName: event.eventName }, 'Failed to publish balance update to Redis');
  }

  // Aqui você pode:
  // - Invalidar cache de saldo
  // - Atualizar dashboard em tempo real (WebSockets)
  // - Registrar histórico de saldos
};

// Handler para evento de usuário criado
export const handleUserCreated = async (event: DomainEvent): Promise<void> => {
  logger.info({
    eventName: event.eventName,
    userId: event.aggregateId,
    email: event.data.email,
  }, 'Handling UserCreated event');

  // ✅ PUBLICAR NO REDIS PUB/SUB
  try {
    await eventBus.publish('UserCreated', {
      aggregateId: event.aggregateId,
      email: event.data.email,
      name: event.data.name
    }, {
      correlationId: `${event.eventName}-${event.aggregateId}-${Date.now()}`,
      source: 'user-service'
    });
    logger.info({ eventName: event.eventName }, '👤 User created event published to Redis Pub/Sub');
  } catch (error) {
    logger.error({ error, eventName: event.eventName }, 'Failed to publish user created to Redis');
  }

  // Aqui você pode:
  // - Criar conta financeira padrão
  // - Enviar email de boas-vindas
  // - Criar categorias padrão
  // - Registrar em sistema de analytics
};

// Registra todos os handlers
export const registerAllEventHandlers = (): void => {
  eventDispatcher.register('TransactionAdded', handleTransactionAdded);
  eventDispatcher.register('ExcessiveSpendingDetected', handleExcessiveSpendingDetected);
  eventDispatcher.register('BalanceUpdated', handleBalanceUpdated);
  eventDispatcher.register('UserCreated', handleUserCreated);
  
  logger.info('All domain event handlers registered');
};
