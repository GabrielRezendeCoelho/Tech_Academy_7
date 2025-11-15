/**
 * Cache Manager - Cache-Aside Pattern with Redis
 * 
 * Implementa cache distribuído com:
 * - Cache-Aside Pattern (lazy loading)
 * - TTL configurável
 * - Invalidação manual e automática
 * - Namespace para evitar colisões
 * - Serialização automática JSON
 * 
 * Uso:
 * const cached = await cacheManager.get('user:123');
 * await cacheManager.set('user:123', userData, 300); // TTL 5 min
 * await cacheManager.invalidate('user:123');
 * await cacheManager.invalidatePattern('user:*');
 */

import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

export interface CacheOptions {
  ttl?: number; // Time to live em segundos (padrão: 300s = 5min)
  namespace?: string; // Prefixo para chaves (padrão: 'kash')
}

class CacheManager {
  private client: RedisClientType | null = null;
  private defaultTTL: number = 300; // 5 minutos
  private namespace: string = 'kash';
  private isConnected: boolean = false;

  /**
   * Inicializa conexão com Redis
   */
  async connect(redisUrl?: string): Promise<void> {
    try {
      const url = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = createClient({
        url,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis max reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        logger.error({ error: err }, 'Redis client error');
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        logger.warn('Redis client reconnecting');
      });

      await this.client.connect();
      logger.info({ redisUrl: url }, 'Cache manager initialized');
    } catch (error) {
      logger.error({ error }, 'Failed to connect to Redis');
      throw error;
    }
  }

  /**
   * Desconecta do Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Cache manager disconnected');
    }
  }

  /**
   * Gera chave completa com namespace
   */
  private getKey(key: string, namespace?: string): string {
    const ns = namespace || this.namespace;
    return `${ns}:${key}`;
  }

  /**
   * GET - Cache-Aside Pattern: tenta buscar do cache
   * Retorna null se não encontrado ou erro
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping cache get');
      return null;
    }

    try {
      const fullKey = this.getKey(key, options?.namespace);
      const cached = await this.client.get(fullKey);

      if (cached) {
        logger.debug({ key: fullKey }, 'Cache HIT');
        return JSON.parse(cached) as T;
      }

      logger.debug({ key: fullKey }, 'Cache MISS');
      return null;
    } catch (error) {
      logger.error({ key, error }, 'Cache get error');
      return null; // Fail gracefully
    }
  }

  /**
   * SET - Cache-Aside Pattern: salva no cache com TTL
   */
  async set(key: string, value: any, ttl?: number, options?: CacheOptions): Promise<void> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping cache set');
      return;
    }

    try {
      const fullKey = this.getKey(key, options?.namespace);
      const ttlSeconds = ttl || options?.ttl || this.defaultTTL;
      const serialized = JSON.stringify(value);

      await this.client.setEx(fullKey, ttlSeconds, serialized);
      logger.debug({ key: fullKey, ttl: ttlSeconds }, 'Cache SET');
    } catch (error) {
      logger.error({ key, error }, 'Cache set error');
      // Não lança erro - cache é opcional
    }
  }

  /**
   * DELETE - Invalida cache específico
   */
  async invalidate(key: string, options?: CacheOptions): Promise<void> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping cache invalidation');
      return;
    }

    try {
      const fullKey = this.getKey(key, options?.namespace);
      await this.client.del(fullKey);
      logger.debug({ key: fullKey }, 'Cache INVALIDATED');
    } catch (error) {
      logger.error({ key, error }, 'Cache invalidate error');
    }
  }

  /**
   * DELETE PATTERN - Invalida múltiplas chaves por padrão
   * Exemplo: invalidatePattern('user:*') remove user:123, user:456, etc.
   */
  async invalidatePattern(pattern: string, options?: CacheOptions): Promise<void> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping cache invalidation');
      return;
    }

    try {
      const fullPattern = this.getKey(pattern, options?.namespace);
      const keys = await this.client.keys(fullPattern);

      if (keys.length > 0) {
        await this.client.del(keys);
        logger.info({ pattern: fullPattern, count: keys.length }, 'Cache pattern INVALIDATED');
      } else {
        logger.debug({ pattern: fullPattern }, 'No keys to invalidate');
      }
    } catch (error) {
      logger.error({ pattern, error }, 'Cache invalidate pattern error');
    }
  }

  /**
   * FLUSH - Remove todo o cache (usar com cuidado!)
   */
  async flush(): Promise<void> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping cache flush');
      return;
    }

    try {
      await this.client.flushDb();
      logger.warn('Cache FLUSHED');
    } catch (error) {
      logger.error({ error }, 'Cache flush error');
    }
  }

  /**
   * TTL - Verifica tempo restante de uma chave
   */
  async getTTL(key: string, options?: CacheOptions): Promise<number> {
    if (!this.isConnected || !this.client) {
      return -1;
    }

    try {
      const fullKey = this.getKey(key, options?.namespace);
      return await this.client.ttl(fullKey);
    } catch (error) {
      logger.error({ key, error }, 'Cache TTL error');
      return -1;
    }
  }

  /**
   * EXISTS - Verifica se chave existe
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const fullKey = this.getKey(key, options?.namespace);
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      logger.error({ key, error }, 'Cache exists error');
      return false;
    }
  }

  /**
   * Helper: wrap de função com cache (cache-aside automático)
   * 
   * Uso:
   * const user = await cacheManager.wrap('user:123', 
   *   async () => await db.findUser(123),
   *   { ttl: 600 }
   * );
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // 1. Tenta buscar do cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // 2. Cache miss - executa função
    const result = await fn();

    // 3. Salva no cache
    await this.set(key, result, options?.ttl, options);

    return result;
  }
}

// Singleton export
export const cacheManager = new CacheManager();
