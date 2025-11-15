import { Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';

// Habilita coleta de métricas padrão (CPU, memória, etc)
promClient.collectDefaultMetrics({ prefix: 'kash_backend_' });

// Contador de requisições HTTP
export const httpRequestsTotal = new promClient.Counter({
  name: 'kash_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
});

// Histograma de duração das requisições
export const httpRequestDuration = new promClient.Histogram({
  name: 'kash_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5], // buckets em segundos
});

// Gauge para conexões de banco de dados ativas
export const dbConnectionsActive = new promClient.Gauge({
  name: 'kash_db_connections_active',
  help: 'Number of active database connections',
});

// Contador de erros de banco de dados
export const dbErrorsTotal = new promClient.Counter({
  name: 'kash_db_errors_total',
  help: 'Total number of database errors',
  labelNames: ['operation'],
});

// Contador de falhas de autenticação
export const authFailuresTotal = new promClient.Counter({
  name: 'kash_auth_failures_total',
  help: 'Total number of authentication failures',
  labelNames: ['reason'],
});

// Gauge para profundidade da fila (se implementado)
export const queueDepth = new promClient.Gauge({
  name: 'kash_queue_depth',
  help: 'Current depth of job queue',
  labelNames: ['queue_name'],
});

// Contador de cache hits/misses
export const cacheHits = new promClient.Counter({
  name: 'kash_cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_key_prefix'],
});

export const cacheMisses = new promClient.Counter({
  name: 'kash_cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_key_prefix'],
});

// Middleware para coletar métricas de requisições HTTP
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Intercepta o response.end para coletar métricas
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = (Date.now() - startTime) / 1000; // converter para segundos
    const path = req.route?.path || req.path;
    const method = req.method;
    const status = res.statusCode;

    // Incrementa contador de requisições
    httpRequestsTotal.inc({ method, path, status });

    // Registra duração da requisição
    httpRequestDuration.observe({ method, path, status }, duration);

    return originalEnd.apply(res, args as any);
  };

  next();
};

// Endpoint para expor métricas
export const metricsEndpoint = async (_req: Request, res: Response) => {
  res.set('Content-Type', promClient.register.contentType);
  const metrics = await promClient.register.metrics();
  res.end(metrics);
};

// Helper para registrar erros de DB
export const recordDbError = (operation: string) => {
  dbErrorsTotal.inc({ operation });
};

// Helper para registrar falhas de autenticação
export const recordAuthFailure = (reason: string) => {
  authFailuresTotal.inc({ reason });
};

// Helper para registrar cache hits/misses
export const recordCacheHit = (keyPrefix: string) => {
  cacheHits.inc({ cache_key_prefix: keyPrefix });
};

export const recordCacheMiss = (keyPrefix: string) => {
  cacheMisses.inc({ cache_key_prefix: keyPrefix });
};
