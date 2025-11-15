import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Estende o tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: 'admin' | 'user';
      };
      requestId?: string;
      logger?: any;
    }
  }
}

// Middleware de autenticação JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    logger.warn({ path: req.path, requestId: req.requestId }, 'Authentication failed: No token provided');
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreta') as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user', // Default para 'user' se não especificado
    };
    
    logger.info({ userId: req.user.id, requestId: req.requestId }, 'User authenticated');
    next();
  } catch (error) {
    logger.warn({ error, requestId: req.requestId }, 'Authentication failed: Invalid token');
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// Middleware de autorização por roles
export const requireRole = (...allowedRoles: Array<'admin' | 'user'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.error({ path: req.path, requestId: req.requestId }, 'Authorization check failed: No user in request');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn({
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
        requestId: req.requestId,
      }, 'Authorization failed: Insufficient permissions');
      
      return res.status(403).json({ error: 'Acesso negado: permissão insuficiente' });
    }

    logger.info({
      userId: req.user.id,
      userRole: req.user.role,
      requestId: req.requestId,
    }, 'Authorization successful');
    
    next();
  };
};

// Middleware para verificar ownership (usuário só pode acessar seus próprios recursos)
export const ensureOwnership = (getUserIdFromRequest: (req: Request) => number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const resourceUserId = getUserIdFromRequest(req);
    
    // Admin pode acessar qualquer recurso
    if (req.user.role === 'admin') {
      logger.info({ userId: req.user.id, resourceUserId, requestId: req.requestId }, 'Admin access granted');
      return next();
    }

    // Usuário comum só pode acessar seus próprios recursos
    if (req.user.id !== resourceUserId) {
      logger.warn({
        userId: req.user.id,
        resourceUserId,
        requestId: req.requestId,
      }, 'Ownership check failed');
      
      return res.status(403).json({ error: 'Acesso negado: você só pode acessar seus próprios recursos' });
    }

    logger.info({ userId: req.user.id, requestId: req.requestId }, 'Ownership verified');
    next();
  };
};
