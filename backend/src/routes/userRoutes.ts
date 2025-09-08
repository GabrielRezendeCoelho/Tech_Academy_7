import { Router } from 'express';
import { createUser, listUsers, getUser, loginUser, updateUserByToken, updateEmailByToken, updatePasswordByToken, deleteUserByToken, resetPasswordByEmail } from '../controllers/userController';

const router = Router();

router.put('/update-password', updatePasswordByToken);
router.put('/update-email', updateEmailByToken);
router.put('/update', updateUserByToken);
router.post('/login', loginUser);
router.post('/', createUser);
router.get('/', listUsers);
router.get('/:id', getUser);
router.delete('/delete', deleteUserByToken);
router.post('/reset-password', resetPasswordByEmail);

export default router;