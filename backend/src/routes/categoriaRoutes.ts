import { Router } from 'express';
import { createCategoria, listCategorias, getCategoria, updateCategoria, deleteCategoria } from '../controllers/categoriaController';

const router = Router();

router.post('/', createCategoria);
router.get('/', listCategorias);
router.get('/:id', getCategoria);
router.put('/:id', updateCategoria);
router.delete('/:id', deleteCategoria);

export default router;
