import { Router } from 'express';
import { createUser, listUsers, getUser, loginUser } from '../controllers/userController';

const router = Router();

router.post('/login', loginUser);
router.post('/', createUser);
router.get('/', listUsers);
router.get('/:id', getUser);

export default router;