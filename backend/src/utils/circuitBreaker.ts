import CircuitBreaker from 'opossum';
import { logger } from './logger';
import { recordDbError } from '../middleware/metrics';

// Opções padrão para circuit breaker
const defaultOptions = {
  timeout: 10000, // 10 segundos
  errorThresholdPercentage: 50, // Abre o circuito se 50% das requisições falharem
  resetTimeout: 30000, // 30 segundos para tentar fechar o circuito
  rollingCountTimeout: 10000, // Janela de 10 segundos para contar erros
  rollingCountBuckets: 10, // 10 buckets na janela
  name: 'default',
};

// Cria um circuit breaker para operações de banco de dados
export const createDbCircuitBreaker = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: Partial<typeof defaultOptions>
): CircuitBreaker<any[], any> => {
  const opts = { ...defaultOptions, ...options, name: options?.name || 'database' };
  const breaker = new CircuitBreaker(fn, opts);

  // Event listeners para logging
  breaker.on('open', () => {
    logger.error({ breakerName: opts.name }, 'Circuit breaker OPENED - too many failures');
    recordDbError('circuit_open');
  });

  breaker.on('halfOpen', () => {
    logger.warn({ breakerName: opts.name }, 'Circuit breaker HALF-OPEN - testing if service recovered');
  });

  breaker.on('close', () => {
    logger.info({ breakerName: opts.name }, 'Circuit breaker CLOSED - service recovered');
  });

  breaker.on('failure', (error) => {
    logger.warn({ breakerName: opts.name, error: error.message }, 'Circuit breaker - operation failed');
    recordDbError('operation_failure');
  });

  breaker.on('timeout', () => {
    logger.warn({ breakerName: opts.name, timeout: opts.timeout }, 'Circuit breaker - operation timed out');
    recordDbError('timeout');
  });

  breaker.on('reject', () => {
    logger.warn({ breakerName: opts.name }, 'Circuit breaker - operation rejected (circuit is open)');
    recordDbError('circuit_rejected');
  });

  breaker.on('success', (result) => {
    logger.debug({ breakerName: opts.name }, 'Circuit breaker - operation succeeded');
  });

  return breaker;
};

// Circuit breaker para operações externas (APIs, serviços)
export const createExternalServiceCircuitBreaker = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  serviceName: string,
  options?: Partial<typeof defaultOptions>
): CircuitBreaker<any[], any> => {
  const opts = {
    ...defaultOptions,
    timeout: 5000, // 5 segundos para serviços externos
    errorThresholdPercentage: 30, // Mais sensível para serviços externos
    ...options,
    name: serviceName,
  };

  const breaker = new CircuitBreaker(fn, opts);

  // Event listeners
  breaker.on('open', () => {
    logger.error({ service: serviceName }, `Circuit breaker OPENED for external service: ${serviceName}`);
  });

  breaker.on('halfOpen', () => {
    logger.warn({ service: serviceName }, `Circuit breaker HALF-OPEN for external service: ${serviceName}`);
  });

  breaker.on('close', () => {
    logger.info({ service: serviceName }, `Circuit breaker CLOSED for external service: ${serviceName}`);
  });

  breaker.on('failure', (error) => {
    logger.warn({ service: serviceName, error: error.message }, 'External service call failed');
  });

  breaker.on('timeout', () => {
    logger.warn({ service: serviceName, timeout: opts.timeout }, 'External service call timed out');
  });

  return breaker;
};

// Wrapper para retry com backoff exponencial
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        // Backoff exponencial com jitter
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
        const jitter = Math.random() * 0.3 * delay; // 30% de jitter
        const totalDelay = delay + jitter;
        
        logger.warn({
          attempt: attempt + 1,
          maxRetries,
          nextRetryIn: totalDelay,
          error: lastError.message,
        }, 'Operation failed, retrying...');
        
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }
  }
  
  logger.error({
    maxRetries,
    error: lastError!.message,
  }, 'Operation failed after all retries');
  
  throw lastError!;
};

// Helper para adicionar timeout a uma promise
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        logger.warn({ operation, timeout: timeoutMs }, 'Operation timed out');
        reject(new Error(`Operation ${operation} timed out after ${timeoutMs}ms`));
      }, timeoutMs)
    ),
  ]);
};
