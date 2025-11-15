/**
 * Event Bus - Redis Pub/Sub for Domain Events
 * 
 * Implementa mensageria distribuída para eventos de domínio usando Redis Pub/Sub.
 * Permite comunicação assíncrona entre microserviços/bounded contexts.
 * 
 * Características:
 * - Publish/Subscribe pattern
 * - Múltiplos subscribers por canal
 * - Logs estruturados de eventos
 * - Reconexão automática
 * - Type-safe events
 * 
 * Uso:
 * // Publisher
 * await eventBus.publish('transaction.created', { userId: 123, amount: 100 });
 * 
 * // Subscriber
 * await eventBus.subscribe('transaction.created', (event) => {
 *   console.log('Transaction created:', event);
 * });
 */

import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

export interface DomainEvent {
  eventType: string;
  eventId: string;
  timestamp: string;
  aggregateId: string | number;
  data: any;
  metadata?: {
    userId?: string;
    correlationId?: string;
    causationId?: string;
    [key: string]: any;
  };
}

type EventHandler = (event: DomainEvent) => void | Promise<void>;

class EventBus {
  private publisher: RedisClientType | null = null;
  private subscriber: RedisClientType | null = null;
  private handlers: Map<string, EventHandler[]> = new Map();
  private isConnected: boolean = false;
  private channelPrefix: string = 'kash:events';

  /**
   * Inicializa conexão Pub/Sub com Redis
   */
  async connect(redisUrl?: string): Promise<void> {
    try {
      const url = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';

      // Client para publicação
      this.publisher = createClient({ url });
      
      this.publisher.on('error', (err) => {
        logger.error({ error: err }, 'Redis publisher error');
      });

      await this.publisher.connect();

      // Client separado para subscrição (Redis requirement)
      this.subscriber = createClient({ url });
      
      this.subscriber.on('error', (err) => {
        logger.error({ error: err }, 'Redis subscriber error');
      });

      await this.subscriber.connect();

      this.isConnected = true;
      logger.info('Event bus connected to Redis Pub/Sub');
    } catch (error) {
      logger.error({ error }, 'Failed to connect event bus');
      throw error;
    }
  }

  /**
   * Desconecta do Redis
   */
  async disconnect(): Promise<void> {
    if (this.publisher) {
      await this.publisher.quit();
    }
    if (this.subscriber) {
      await this.subscriber.quit();
    }
    this.isConnected = false;
    logger.info('Event bus disconnected');
  }

  /**
   * Gera nome completo do canal
   */
  private getChannelName(eventType: string): string {
    return `${this.channelPrefix}:${eventType}`;
  }

  /**
   * PUBLISH - Publica evento no canal
   * 
   * @param eventType - Tipo do evento (ex: 'transaction.created')
   * @param data - Dados do evento
   * @param metadata - Metadados opcionais (userId, correlationId, etc)
   */
  async publish(
    eventType: string,
    data: any,
    metadata?: DomainEvent['metadata']
  ): Promise<void> {
    if (!this.isConnected || !this.publisher) {
      logger.warn({ eventType }, 'Event bus not connected, skipping publish');
      return;
    }

    try {
      const event: DomainEvent = {
        eventType,
        eventId: this.generateEventId(),
        timestamp: new Date().toISOString(),
        aggregateId: data.aggregateId || data.id || 'unknown',
        data,
        metadata
      };

      const channel = this.getChannelName(eventType);
      const serialized = JSON.stringify(event);

      await this.publisher.publish(channel, serialized);

      logger.info(
        {
          eventType,
          eventId: event.eventId,
          aggregateId: event.aggregateId,
          channel
        },
        'Event published'
      );

      // Log estruturado do evento para auditoria
      this.logEvent(event);
    } catch (error) {
      logger.error({ eventType, error }, 'Failed to publish event');
      throw error;
    }
  }

  /**
   * SUBSCRIBE - Registra handler para tipo de evento
   * 
   * @param eventType - Tipo do evento (ex: 'transaction.created')
   * @param handler - Função callback que processa o evento
   */
  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    if (!this.isConnected || !this.subscriber) {
      logger.warn({ eventType }, 'Event bus not connected, skipping subscribe');
      return;
    }

    try {
      const channel = this.getChannelName(eventType);

      // Adiciona handler à lista de handlers deste canal
      if (!this.handlers.has(channel)) {
        this.handlers.set(channel, []);

        // Registra listener no Redis apenas uma vez por canal
        await this.subscriber.subscribe(channel, (message) => {
          this.handleMessage(channel, message);
        });

        logger.info({ eventType, channel }, 'Subscribed to event channel');
      }

      this.handlers.get(channel)!.push(handler);
      logger.debug({ eventType, handlersCount: this.handlers.get(channel)!.length }, 'Event handler registered');
    } catch (error) {
      logger.error({ eventType, error }, 'Failed to subscribe to event');
      throw error;
    }
  }

  /**
   * UNSUBSCRIBE - Remove handler de evento
   */
  async unsubscribe(eventType: string, handler?: EventHandler): Promise<void> {
    const channel = this.getChannelName(eventType);

    if (!handler) {
      // Remove todos os handlers deste canal
      this.handlers.delete(channel);
      if (this.subscriber) {
        await this.subscriber.unsubscribe(channel);
      }
      logger.info({ eventType, channel }, 'Unsubscribed from channel');
    } else {
      // Remove handler específico
      const handlers = this.handlers.get(channel) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }

      // Se não há mais handlers, desinscreve do canal
      if (handlers.length === 0) {
        this.handlers.delete(channel);
        if (this.subscriber) {
          await this.subscriber.unsubscribe(channel);
        }
      }
    }
  }

  /**
   * PATTERN SUBSCRIBE - Inscreve em múltiplos canais com padrão
   * 
   * Exemplo: subscribePattern('transaction.*', handler)
   * Escuta: transaction.created, transaction.updated, etc.
   */
  async subscribePattern(pattern: string, handler: EventHandler): Promise<void> {
    if (!this.isConnected || !this.subscriber) {
      logger.warn({ pattern }, 'Event bus not connected, skipping pattern subscribe');
      return;
    }

    try {
      const channelPattern = this.getChannelName(pattern);

      if (!this.handlers.has(channelPattern)) {
        this.handlers.set(channelPattern, []);

        await this.subscriber.pSubscribe(channelPattern, (message, channel) => {
          this.handleMessage(channel, message);
        });

        logger.info({ pattern, channelPattern }, 'Subscribed to pattern');
      }

      this.handlers.get(channelPattern)!.push(handler);
    } catch (error) {
      logger.error({ pattern, error }, 'Failed to subscribe to pattern');
      throw error;
    }
  }

  /**
   * Handler interno que processa mensagens recebidas
   */
  private async handleMessage(channel: string, message: string): Promise<void> {
    try {
      const event: DomainEvent = JSON.parse(message);

      logger.info(
        {
          eventType: event.eventType,
          eventId: event.eventId,
          channel
        },
        'Event received'
      );

      // Executa todos os handlers registrados para este canal
      const handlers = this.handlers.get(channel) || [];

      for (const handler of handlers) {
        try {
          await handler(event);
        } catch (error) {
          logger.error(
            {
              eventType: event.eventType,
              eventId: event.eventId,
              error
            },
            'Event handler error'
          );
          // Continua executando outros handlers mesmo se um falhar
        }
      }
    } catch (error) {
      logger.error({ channel, error }, 'Failed to handle event message');
    }
  }

  /**
   * Log estruturado de eventos para auditoria
   */
  private logEvent(event: DomainEvent): void {
    logger.info(
      {
        event: {
          type: event.eventType,
          id: event.eventId,
          timestamp: event.timestamp,
          aggregateId: event.aggregateId
        },
        data: event.data,
        metadata: event.metadata
      },
      'Domain event logged'
    );
  }

  /**
   * Gera ID único para evento
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Verifica se está conectado
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Retorna estatísticas do event bus
   */
  getStats(): {
    connected: boolean;
    subscribedChannels: number;
    totalHandlers: number;
  } {
    let totalHandlers = 0;
    this.handlers.forEach((handlers) => {
      totalHandlers += handlers.length;
    });

    return {
      connected: this.isConnected,
      subscribedChannels: this.handlers.size,
      totalHandlers
    };
  }
}

// Singleton export
export const eventBus = new EventBus();
