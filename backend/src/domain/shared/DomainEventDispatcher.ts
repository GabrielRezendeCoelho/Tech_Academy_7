import { logger } from '../../utils/logger';

// Interface para eventos de domínio
export interface DomainEvent {
  eventName: string;
  occurredOn: Date;
  aggregateId: string | number;
  data: any;
}

// Tipo para handlers de eventos
type EventHandler = (event: DomainEvent) => Promise<void> | void;

// Event Dispatcher Singleton
class DomainEventDispatcher {
  private static instance: DomainEventDispatcher;
  private handlers: Map<string, EventHandler[]>;

  private constructor() {
    this.handlers = new Map();
  }

  public static getInstance(): DomainEventDispatcher {
    if (!DomainEventDispatcher.instance) {
      DomainEventDispatcher.instance = new DomainEventDispatcher();
    }
    return DomainEventDispatcher.instance;
  }

  // Registra um handler para um tipo de evento
  public register(eventName: string, handler: EventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
    logger.info({ eventName, handlerCount: this.handlers.get(eventName)!.length }, 'Event handler registered');
  }

  // Remove um handler
  public unregister(eventName: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        logger.info({ eventName }, 'Event handler unregistered');
      }
    }
  }

  // Dispara um evento para todos os handlers registrados
  public async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) || [];
    
    logger.info({
      eventName: event.eventName,
      aggregateId: event.aggregateId,
      handlerCount: handlers.length,
      occurredOn: event.occurredOn,
    }, 'Dispatching domain event');

    const promises = handlers.map(async (handler) => {
      try {
        await handler(event);
        logger.debug({ eventName: event.eventName, aggregateId: event.aggregateId }, 'Event handler executed successfully');
      } catch (error) {
        logger.error({
          eventName: event.eventName,
          aggregateId: event.aggregateId,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, 'Error executing event handler');
      }
    });

    await Promise.all(promises);
  }

  // Limpa todos os handlers (útil para testes)
  public clearAll(): void {
    this.handlers.clear();
    logger.info('All event handlers cleared');
  }

  // Retorna número de handlers registrados para um evento
  public getHandlerCount(eventName: string): number {
    return this.handlers.get(eventName)?.length || 0;
  }
}

export const eventDispatcher = DomainEventDispatcher.getInstance();
