/**
 * Cache Middleware - HTTP Response Caching
 * 
 * Middleware para cache automático de respostas HTTP usando Redis.
 * Implementa cache-aside pattern com invalidação inteligente.
 * 
 * Uso:
 * router.get('/users/:id', cacheMiddleware({ ttl: 300 }), getUser);
 * router.post('/users', invalidateCacheMiddleware(['user:*']), createUser);
 */

import { Request, Response, NextFunction } from 'express';
import { cacheManager } from '../utils/cacheManager';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export interface CacheMiddlewareOptions {
  ttl?: number; // TTL em segundos
  keyPrefix?: string; // Prefixo da chave
  includeQuery?: boolean; // Incluir query params na chave
  includeBody?: boolean; // Incluir body na chave (para POST/PUT)
  customKeyFn?: (req: Request) => string; // Função customizada para gerar chave
  skipCache?: (req: Request) => boolean; // Função para pular cache
}

/**
 * Gera chave de cache baseada na requisição
 */
function generateCacheKey(req: Request, options: CacheMiddlewareOptions): string {
  // Usa função customizada se fornecida
  if (options.customKeyFn) {
    return options.customKeyFn(req);
  }

  // Partes da chave
  const parts: string[] = [
    options.keyPrefix || 'http',
    req.method,
    req.path
  ];

  // Adiciona parâmetros de rota
  if (req.params && Object.keys(req.params).length > 0) {
    parts.push(JSON.stringify(req.params));
  }

  // Adiciona query string se configurado
  if (options.includeQuery && req.query && Object.keys(req.query).length > 0) {
    parts.push(JSON.stringify(req.query));
  }

  // Adiciona body se configurado (hash para evitar chaves muito longas)
  if (options.includeBody && req.body && Object.keys(req.body).length > 0) {
    const bodyHash = crypto
      .createHash('md5')
      .update(JSON.stringify(req.body))
      .digest('hex');
    parts.push(bodyHash);
  }

  // Adiciona userId para cache por usuário
  if ((req as any).user?.id) {
    parts.push(`user:${(req as any).user.id}`);
  }

  return parts.join(':');
}

/**
 * Middleware de cache para responses HTTP
 * 
 * Exemplo:
 * router.get('/api/saldo/:userId', 
 *   cacheMiddleware({ ttl: 60, keyPrefix: 'saldo' }), 
 *   getSaldoController
 * );
 */
export function cacheMiddleware(options: CacheMiddlewareOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Apenas cacheia GET requests por padrão
    if (req.method !== 'GET') {
      return next();
    }

    // Verifica se deve pular cache
    if (options.skipCache && options.skipCache(req)) {
      logger.debug({ path: req.path }, 'Skipping cache by skipCache function');
      return next();
    }

    const cacheKey = generateCacheKey(req, options);
    const requestId = (req as any).id || 'unknown';

    try {
      // Tenta buscar do cache
      const cached = await cacheManager.get<any>(cacheKey);

      if (cached) {
        logger.info(
          { 
            cacheKey, 
            requestId, 
            path: req.path,
            method: req.method 
          }, 
          'Cache HIT - Response served from cache'
        );

        // Adiciona headers de cache
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);

        // Retorna resposta do cache
        return res.status(cached.status || 200).json(cached.data);
      }

      logger.debug({ cacheKey, requestId }, 'Cache MISS - Executing handler');
      res.setHeader('X-Cache', 'MISS');

      // Intercepta response para cachear
      const originalJson = res.json.bind(res);

      res.json = function (body: any) {
        // Salva no cache apenas se status 200-299
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const dataToCache = {
            status: res.statusCode,
            data: body
          };

          cacheManager.set(cacheKey, dataToCache, options.ttl).catch((err) => {
            logger.error({ error: err, cacheKey }, 'Failed to cache response');
          });

          logger.debug(
            { cacheKey, ttl: options.ttl || 300, statusCode: res.statusCode }, 
            'Response cached'
          );
        }

        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error({ error, cacheKey, requestId }, 'Cache middleware error');
      // Fail gracefully - continua sem cache
      next();
    }
  };
}

/**
 * Middleware para invalidar cache após mutações
 * 
 * Exemplo:
 * router.post('/api/saldo', 
 *   invalidateCacheMiddleware(['saldo:*', 'user:123']),
 *   createSaldoController
 * );
 */
export function invalidateCacheMiddleware(patterns: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as any).id || 'unknown';

    // Executa handler primeiro
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      // Invalida cache apenas se operação foi bem-sucedida (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalida de forma assíncrona (não bloqueia response)
        Promise.all(
          patterns.map((pattern) => cacheManager.invalidatePattern(pattern))
        )
          .then(() => {
            logger.info(
              { patterns, requestId, path: req.path }, 
              'Cache invalidated after mutation'
            );
          })
          .catch((err) => {
            logger.error({ error: err, patterns }, 'Failed to invalidate cache');
          });
      }

      return originalJson(body);
    };

    next();
  };
}

/**
 * Middleware para adicionar cabeçalhos de controle de cache HTTP
 * 
 * Exemplo:
 * router.get('/public/data', 
 *   httpCacheHeaders({ maxAge: 3600, public: true }),
 *   getPublicData
 * );
 */
export function httpCacheHeaders(options: {
  maxAge?: number; // segundos
  sMaxAge?: number; // segundos para cache compartilhado
  public?: boolean; // Cache público ou privado
  noCache?: boolean; // Force revalidação
  noStore?: boolean; // Não armazene
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (options.noStore) {
      res.setHeader('Cache-Control', 'no-store');
      return next();
    }

    if (options.noCache) {
      res.setHeader('Cache-Control', 'no-cache');
      return next();
    }

    const directives: string[] = [];

    if (options.public) {
      directives.push('public');
    } else {
      directives.push('private');
    }

    if (options.maxAge !== undefined) {
      directives.push(`max-age=${options.maxAge}`);
    }

    if (options.sMaxAge !== undefined) {
      directives.push(`s-maxage=${options.sMaxAge}`);
    }

    res.setHeader('Cache-Control', directives.join(', '));
    next();
  };
}
