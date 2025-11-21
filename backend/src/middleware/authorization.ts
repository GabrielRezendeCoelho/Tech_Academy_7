/**
 * Authorization Middleware - Role-Based Access Control (RBAC)
 * 
 * Middleware para controle de acesso baseado em roles (admin, user).
 * Deve ser usado após o authentication middleware.
 * 
 * Uso:
 * router.delete('/users/:id', authenticate, requireRole('admin'), deleteUser);
 * router.get('/admin/reports', authenticate, requireRole('admin'), getReports);
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'user' | 'admin';
  };
}

/**
 * Middleware que requer role específica
 * 
 * @param role - Role necessária ('admin' ou 'user')
 * @returns Express middleware
 * 
 * @example
 * // Apenas admin pode deletar usuários
 * router.delete('/users/:id', authenticate, requireRole('admin'), deleteUser);
 * 
 * @example
 * // Apenas admin pode acessar relatórios
 * router.get('/admin/reports', authenticate, requireRole('admin'), getReports);
 */
export function requireRole(role: 'admin' | 'user') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Verifica se usuário está autenticado
    if (!req.user) {
      logger.warn(
        { path: req.path, method: req.method },
        'Authorization failed: No user in request'
      );
      return res.status(401).json({ 
        error: 'Não autenticado. Por favor, faça login.' 
      });
    }

    // Verifica se usuário tem a role necessária
    if (req.user.role !== role) {
      logger.warn(
        {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRole: role,
          path: req.path,
          method: req.method,
        },
        'Authorization failed: Insufficient permissions'
      );

      return res.status(403).json({
        error: 'Acesso negado. Permissões insuficientes.',
        required: role,
        current: req.user.role,
      });
    }

    // Usuário tem permissão, continua
    logger.debug(
      {
        userId: req.user.id,
        role: req.user.role,
        path: req.path,
      },
      'Authorization successful'
    );

    next();
  };
}

/**
 * Middleware que permite múltiplas roles
 * 
 * @param roles - Array de roles permitidas
 * @returns Express middleware
 * 
 * @example
 * // Admin ou user podem ver próprios dados
 * router.get('/users/me', authenticate, requireAnyRole(['admin', 'user']), getMe);
 */
export function requireAnyRole(roles: Array<'admin' | 'user'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn(
        { path: req.path, method: req.method },
        'Authorization failed: No user in request'
      );
      return res.status(401).json({ 
        error: 'Não autenticado. Por favor, faça login.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        {
          userId: req.user.id,
          userRole: req.user.role,
          allowedRoles: roles,
          path: req.path,
          method: req.method,
        },
        'Authorization failed: Role not in allowed list'
      );

      return res.status(403).json({
        error: 'Acesso negado. Permissões insuficientes.',
        allowedRoles: roles,
        currentRole: req.user.role,
      });
    }

    next();
  };
}

/**
 * Middleware que verifica ownership (usuário só pode acessar seus próprios recursos)
 * 
 * @param userIdParam - Nome do parâmetro que contém o userId (padrão: 'userId' ou 'id')
 * @returns Express middleware
 * 
 * @example
 * // Usuário só pode ver suas próprias transações
 * router.get('/users/:userId/transactions', authenticate, requireOwnership('userId'), getTransactions);
 * 
 * @example
 * // Usuário só pode editar seu próprio perfil (admin bypassa)
 * router.put('/users/:id', authenticate, requireOwnershipOrAdmin('id'), updateUser);
 */
export function requireOwnership(userIdParam: string = 'userId') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Não autenticado. Por favor, faça login.' 
      });
    }

    const targetUserId = parseInt(req.params[userIdParam], 10);

    if (isNaN(targetUserId)) {
      return res.status(400).json({ 
        error: `Parâmetro '${userIdParam}' inválido.` 
      });
    }

    if (req.user.id !== targetUserId) {
      logger.warn(
        {
          userId: req.user.id,
          targetUserId,
          path: req.path,
          method: req.method,
        },
        'Ownership check failed: User trying to access another user\'s resource'
      );

      return res.status(403).json({
        error: 'Acesso negado. Você só pode acessar seus próprios recursos.',
      });
    }

    next();
  };
}

/**
 * Middleware que verifica ownership OU role admin (admin bypassa ownership)
 * 
 * @param userIdParam - Nome do parâmetro que contém o userId
 * @returns Express middleware
 * 
 * @example
 * // Usuário pode editar próprio perfil, admin pode editar qualquer perfil
 * router.put('/users/:id', authenticate, requireOwnershipOrAdmin('id'), updateUser);
 */
export function requireOwnershipOrAdmin(userIdParam: string = 'userId') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Não autenticado. Por favor, faça login.' 
      });
    }

    // Admin bypassa ownership check
    if (req.user.role === 'admin') {
      logger.debug(
        {
          userId: req.user.id,
          role: 'admin',
          path: req.path,
        },
        'Admin bypass: Ownership check skipped'
      );
      return next();
    }

    // User: verifica ownership
    const targetUserId = parseInt(req.params[userIdParam], 10);

    if (isNaN(targetUserId)) {
      return res.status(400).json({ 
        error: `Parâmetro '${userIdParam}' inválido.` 
      });
    }

    if (req.user.id !== targetUserId) {
      logger.warn(
        {
          userId: req.user.id,
          targetUserId,
          path: req.path,
          method: req.method,
        },
        'Ownership check failed: User trying to access another user\'s resource'
      );

      return res.status(403).json({
        error: 'Acesso negado. Você só pode acessar seus próprios recursos.',
      });
    }

    next();
  };
}

/**
 * Middleware que verifica se usuário é admin
 * Atalho para requireRole('admin')
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware que verifica se usuário está autenticado (qualquer role)
 * Atalho para requireAnyRole(['admin', 'user'])
 */
export const requireAuthenticated = requireAnyRole(['admin', 'user']);
