import pino from 'pino';
import { Request, Response, NextFunction } from 'express';

// Configuração do logger com formato JSON estruturado
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'kash-backend',
  },
});

// Middleware para adicionar requestId e logging automático
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Adiciona requestId ao request para uso posterior
  (req as any).requestId = requestId;
  (req as any).logger = logger.child({ requestId });

  // Log da requisição inicial
  (req as any).logger.info({
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }, 'Incoming request');

  // Intercepta o response.end para logar a resposta
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - startTime;
    
    (req as any).logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
    }, 'Request completed');

    return originalEnd.apply(res, args as any);
  };

  next();
};

// Helper para logar erros com contexto completo
export const logError = (error: Error, context?: any) => {
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  }, 'Error occurred');
};

// Helper para logar eventos de domínio
export const logDomainEvent = (eventName: string, data: any, requestId?: string) => {
  logger.info({
    eventType: 'domain_event',
    eventName,
    data,
    requestId,
  }, `Domain event: ${eventName}`);
};

export default logger;
