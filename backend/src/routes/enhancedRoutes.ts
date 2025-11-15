// Exemplo de rotas usando TODOS os middlewares novos
import { Router } from 'express';
import { authenticateToken, requireRole, ensureOwnership } from '../middleware/auth';
import {
  getSaldoWithAllFeatures,
  addTransactionWithAllFeatures,
  deleteTransactionWithAuth,
  getAdminStatistics
} from '../controllers/saldoControllerEnhanced';

const router = Router();

// ============================================================================
// ROTAS PÚBLICAS (sem autenticação)
// ============================================================================

// Health check - sempre público
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Métricas - sempre público (ou proteger se preferir)
// router.get('/metrics', metricsEndpoint);

// ============================================================================
// ROTAS COM AUTENTICAÇÃO BÁSICA
// Requer apenas token JWT válido
// ============================================================================

// Buscar saldo do usuário autenticado
// Qualquer usuário autenticado pode ver seu próprio saldo
router.get('/saldos', 
  authenticateToken,
  getSaldoWithAllFeatures
);

// Adicionar transação
// Qualquer usuário autenticado pode adicionar transação
router.post('/saldos', 
  authenticateToken,
  addTransactionWithAllFeatures
);

// ============================================================================
// ROTAS COM OWNERSHIP
// Requer autenticação + usuário deve ser dono do recurso OU admin
// ============================================================================

// Deletar transação específica
// Apenas o dono da transação (ou admin) pode deletar
router.delete('/saldos/:id',
  authenticateToken,
  ensureOwnership((req) => {
    // Aqui você precisaria buscar a transação e retornar o userId dela
    // Por simplicidade, assumindo que req.user.id é suficiente
    return req.user!.id;
  }),
  deleteTransactionWithAuth
);

// Atualizar perfil
// Usuário só pode atualizar seu próprio perfil (ou admin pode atualizar qualquer)
router.put('/users/:id',
  authenticateToken,
  ensureOwnership((req) => Number(req.params.id)),
  async (req, res) => {
    res.json({ message: 'Profile updated' });
  }
);

// ============================================================================
// ROTAS APENAS PARA ADMIN
// Requer autenticação + role = 'admin'
// ============================================================================

// Estatísticas do sistema - apenas admin
router.get('/admin/statistics',
  authenticateToken,
  requireRole('admin'),
  getAdminStatistics
);

// Listar todos os usuários - apenas admin
router.get('/admin/users',
  authenticateToken,
  requireRole('admin'),
  async (req, res) => {
    const logger = (req as any).logger;
    logger.info({ adminId: req.user!.id }, 'Admin listing all users');
    res.json({ users: [] }); // Implementar
  }
);

// Deletar qualquer usuário - apenas admin
router.delete('/admin/users/:id',
  authenticateToken,
  requireRole('admin'),
  async (req, res) => {
    const logger = (req as any).logger;
    logger.warn({ 
      adminId: req.user!.id, 
      targetUserId: req.params.id 
    }, 'Admin deleting user');
    res.json({ message: 'User deleted' }); // Implementar
  }
);

// ============================================================================
// ROTAS COM MÚLTIPLAS ROLES
// Aceita mais de uma role
// ============================================================================

// Dashboard - admin ou user comum
router.get('/dashboard',
  authenticateToken,
  requireRole('admin', 'user'), // Ambos podem acessar
  async (req, res) => {
    const isAdmin = req.user!.role === 'admin';
    
    res.json({
      message: 'Dashboard',
      isAdmin,
      data: isAdmin ? 'Admin data' : 'User data'
    });
  }
);

// ============================================================================
// EXEMPLO DE ROTA COMPLEXA COM TODOS OS RECURSOS
// ============================================================================

router.post('/transactions/batch',
  authenticateToken,                    // 1. Requer autenticação
  requireRole('admin', 'user'),         // 2. Aceita admin ou user
  async (req, res) => {
    const logger = (req as any).logger;
    const requestId = (req as any).requestId;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    logger.info({ 
      userId, 
      userRole, 
      transactionCount: req.body.transactions?.length 
    }, 'Processing batch transactions');
    
    try {
      // Sua lógica aqui
      const transactions = req.body.transactions || [];
      
      // Processar cada transação...
      
      logger.info({ 
        userId, 
        processed: transactions.length 
      }, 'Batch transactions processed');
      
      res.json({ 
        message: 'Transações processadas',
        count: transactions.length 
      });
      
    } catch (error) {
      logger.error({ userId, error, requestId }, 'Error processing batch');
      res.status(500).json({ error: 'Erro ao processar transações' });
    }
  }
);

export default router;
