import { Router } from 'express';
import { 
  createUser, 
  listUsers, 
  getUser, 
  loginUser, 
  updateUserByToken, 
  updateEmailByToken, 
  updatePasswordByToken, 
  deleteUserByToken, 
  resetPassword,
  updateUser,
  deleteUser,
  createAdmin,
  promoteToAdmin,
  demoteFromAdmin,
  uploadProfilePhoto as uploadPhotoController,
  deleteProfilePhoto,
  getUserPhoto,
  getMe
} from '../controllers/userController';
import { requireAdmin, requireOwnershipOrAdmin } from '../middleware/authorization';
import { authenticateToken } from '../middleware/auth';
import { uploadProfilePhoto, handleMulterError } from '../middleware/uploadMiddleware';

const router = Router();

// Rotas públicas (não requerem autenticação)
router.post('/login', loginUser);
router.post('/', createUser);
router.post('/reset-password', resetPassword);

// Rotas protegidas - Usuário autenticado (qualquer role)
router.get('/me', authenticateToken, getMe);
router.put('/update-password', authenticateToken, updatePasswordByToken);
router.put('/update-email', authenticateToken, updateEmailByToken);
router.put('/update', authenticateToken, updateUserByToken);
router.delete('/delete', authenticateToken, deleteUserByToken);

// Rotas de upload de foto (usuário autenticado)
router.post(
  '/photo', 
  authenticateToken, 
  uploadProfilePhoto.single('photo'),
  handleMulterError,
  uploadPhotoController
);
router.delete('/photo', authenticateToken, deleteProfilePhoto);

// Rotas protegidas - Apenas Admin
router.get('/', authenticateToken, requireAdmin, listUsers);
router.post('/admin', authenticateToken, requireAdmin, createAdmin);
router.put('/:id', authenticateToken, requireAdmin, updateUser);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);
router.patch('/:id/promote', authenticateToken, requireAdmin, promoteToAdmin);
router.patch('/:id/demote', authenticateToken, requireAdmin, demoteFromAdmin);
router.get('/:id/photo', authenticateToken, requireAdmin, getUserPhoto);

// Rotas protegidas - Admin ou Owner
router.get('/:id', authenticateToken, requireOwnershipOrAdmin('id'), getUser);

export default router;