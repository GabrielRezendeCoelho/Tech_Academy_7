import { Router } from 'express';
import { createUser, listUsers, getUser } from '../controllers/userController';

const router = Router();

router.post('/', createUser);
router.get('/', listUsers);
router.get('/:id', getUser);

export default router;