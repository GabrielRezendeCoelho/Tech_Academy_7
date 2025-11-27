import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

// Middleware para verificar JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

// Middleware para verificar se é admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas administradores podem acessar este recurso.' 
    });
  }

  next();
};

// Middleware para verificar se é o próprio usuário ou admin
export const requireOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  const targetUserId = parseInt(req.params.userId || req.params.id);

  if (req.user.role === 'admin' || req.user.id === targetUserId) {
    next();
  } else {
    return res.status(403).json({ 
      error: 'Acesso negado. Você só pode modificar seus próprios dados.' 
    });
  }
};
