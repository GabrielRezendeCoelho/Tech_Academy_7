/**
 * Event Bus Integration with Domain Event Dispatcher
 * 
 * Integra o Domain Event Dispatcher local com o Redis Pub/Sub
 * para comunicação distribuída entre microserviços.
 * 
 * Fluxo:
 * 1. Domain Event é disparado localmente (DomainEventDispatcher)
 * 2. Handler local processa o evento
 * 3. Evento é publicado no Redis Pub/Sub (eventBus)
 * 4. Outros serviços/instâncias recebem e processam
 */

/**
 * Event Bus Integration with Domain Event Dispatcher
 * 
 * Integra eventos de domínio local com Redis Pub/Sub para comunicação distribuída.
 * 
 * Nota: A integração completa com DomainEventDispatcher pode ser feita
 * registrando os handlers diretamente nos event handlers existentes.
 * 
 * Este módulo configura apenas os subscribers do event bus.
 */

import { eventBus, DomainEvent } from './eventBus';
import { logger } from './logger';

/**
 * Exemplo de subscribers para eventos distribuídos
 */
export async function setupEventBusSubscribers(): Promise<void> {
  // Subscriber para transações criadas (pode vir de outra instância)
  await eventBus.subscribe('TransactionAdded', async (event: DomainEvent) => {
    logger.info(
      {
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        amount: event.data.amount
      },
      'Transaction added event received from event bus'
    );

    // Processar evento (ex: atualizar cache, enviar notificação, etc)
    // Exemplo: invalidar cache de saldo do usuário
    // await cacheManager.invalidate(`balance:user:${event.data.userId}`);
  });

  // Subscriber para gastos excessivos
  await eventBus.subscribe('ExcessiveSpendingDetected', async (event: DomainEvent) => {
    logger.warn(
      {
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        currentExpenses: event.data.currentExpenses,
        limit: event.data.limit
      },
      'Excessive spending detected event received'
    );

    // Processar evento (ex: enviar email, push notification, etc)
    // Exemplo: enviar alerta para o usuário
    // await notificationService.sendAlert(event.data.userId, 'Gasto excessivo detectado!');
  });

  // Pattern subscriber para todos os eventos de transação
  await eventBus.subscribePattern('Transaction*', async (event: DomainEvent) => {
    logger.debug(
      { eventType: event.eventType, eventId: event.eventId },
      'Transaction pattern event received'
    );

    // Processar qualquer evento relacionado a transações
    // Exemplo: registrar no sistema de auditoria
  });

  // Subscriber para eventos de usuário
  await eventBus.subscribe('UserCreated', async (event: DomainEvent) => {
    logger.info(
      { eventId: event.eventId, userId: event.aggregateId },
      'User created event received'
    );

    // Processar evento (ex: criar conta financeira padrão, enviar email de boas-vindas)
    // Exemplo:
    // await financialAccountService.createDefaultAccount(event.data.userId);
    // await emailService.sendWelcomeEmail(event.data.email);
  });

  logger.info('Event bus subscribers configured');
}

/**
 * Inicializa sistema de eventos distribuídos (Redis Pub/Sub)
 */
export async function initializeEventSystem(redisUrl?: string): Promise<void> {
  try {
    // 1. Conecta ao Redis Pub/Sub
    await eventBus.connect(redisUrl);

    // 2. Configura subscribers para eventos externos
    await setupEventBusSubscribers();

    logger.info('Event system initialized successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to initialize event system');
    throw error;
  }
}

/**
 * Desliga sistema de eventos gracefully
 */
export async function shutdownEventSystem(): Promise<void> {
  await eventBus.disconnect();
  logger.info('Event system shut down');
}
