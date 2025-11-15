import { Router } from 'express';
import { createSaldo, listSaldos, getSaldo, updateSaldo, deleteSaldo, getSaldoUsuario } from '../controllers/saldoController';
import { cacheMiddleware, invalidateCacheMiddleware } from '../middleware/cache';

const router = Router();

// GET routes com cache
router.get('/me', cacheMiddleware(), getSaldoUsuario);
router.get('/', cacheMiddleware(), listSaldos);
router.get('/:id', cacheMiddleware(), getSaldo);

// POST/PUT/DELETE routes com invalidação de cache
router.post('/', invalidateCacheMiddleware(['saldos:*']), createSaldo);
router.put('/:id', invalidateCacheMiddleware(['saldos:*']), updateSaldo);
router.delete('/:id', invalidateCacheMiddleware(['saldos:*']), deleteSaldo);

export default router;
