
import { Router } from 'express';
import { createSaldo, listSaldos, getSaldo, updateSaldo, deleteSaldo, getSaldoUsuario } from '../controllers/saldoController';
const router = Router();
router.get('/me', getSaldoUsuario);

router.post('/', createSaldo);
router.get('/', listSaldos);
router.get('/:id', getSaldo);
router.put('/:id', updateSaldo);
router.delete('/:id', deleteSaldo);

export default router;
