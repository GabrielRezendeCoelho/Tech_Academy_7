import { DomainEvent, eventDispatcher } from '../shared/DomainEventDispatcher';
import { logger } from '../../utils/logger';

// Handler para evento de transação adicionada
export const handleTransactionAdded = async (event: DomainEvent): Promise<void> => {
  logger.info({
    eventName: event.eventName,
    accountId: event.aggregateId,
    transaction: event.data,
  }, 'Handling TransactionAdded event');

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
