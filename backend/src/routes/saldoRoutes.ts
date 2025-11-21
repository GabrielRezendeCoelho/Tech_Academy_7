import { Router } from 'express';
import { createSaldo, listSaldos, getSaldo, updateSaldo, deleteSaldo, getSaldoUsuario } from '../controllers/saldoController';
import { cacheMiddleware, invalidateCacheMiddleware } from '../middleware/cache';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
// GET routes com cache
router.get('/me', authenticateToken, cacheMiddleware(), getSaldoUsuario);
router.get('/', authenticateToken, cacheMiddleware(), listSaldos);
router.get('/:id', authenticateToken, cacheMiddleware(), getSaldo);

// POST/PUT/DELETE routes com invalidação de cache
// Invalida todos os caches HTTP (http:*) para forçar refresh
router.post('/', authenticateToken, invalidateCacheMiddleware(['http:*']), createSaldo);
router.put('/:id', authenticateToken, invalidateCacheMiddleware(['http:*']), updateSaldo);
router.delete('/:id', authenticateToken, invalidateCacheMiddleware(['http:*']), deleteSaldo);

export default router;
