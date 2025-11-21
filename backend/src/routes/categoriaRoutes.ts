import { Router } from 'express';
import { createCategoria, listCategorias, getCategoria, updateCategoria, deleteCategoria } from '../controllers/categoriaController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.post('/', authenticateToken, createCategoria);
router.get('/', authenticateToken, listCategorias);
router.get('/:id', authenticateToken, getCategoria);
router.put('/:id', authenticateToken, updateCategoria);
router.delete('/:id', authenticateToken, deleteCategoria);

export default router;
