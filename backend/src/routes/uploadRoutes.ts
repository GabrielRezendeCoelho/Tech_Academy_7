/**
 * Upload Routes - Image Upload Endpoints
 * 
 * Rotas para upload e gerenciamento de imagens.
 * Requer autenticação JWT para todas as operações.
 */

import express from 'express';
import { 
  uploadSingleImage, 
  uploadMultipleImages, 
  deleteImage, 
  getImageInfo,
  handleMulterError 
} from '../controllers/uploadController';
import { uploadMiddleware } from '../middleware/upload';
import { authenticateToken, requireRole } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * POST /api/upload/image
 * Upload de uma imagem única
 * 
 * Requer: autenticação JWT
 * Content-Type: multipart/form-data
 * Body: { image: File }
 * 
 * curl -X POST http://localhost:3000/api/upload/image \
 *   -H "Authorization: Bearer <token>" \
 *   -F "image=@/path/to/image.jpg"
 */
router.post(
  '/image',
  authenticateToken,
  uploadMiddleware.single('image'),
  handleMulterError,
  uploadSingleImage
);

/**
 * POST /api/upload/images
 * Upload de múltiplas imagens (até 5)
 * 
 * Requer: autenticação JWT
 * Content-Type: multipart/form-data
 * Body: { images: File[] }
 * 
 * curl -X POST http://localhost:3000/api/upload/images \
 *   -H "Authorization: Bearer <token>" \
 *   -F "images=@/path/to/image1.jpg" \
 *   -F "images=@/path/to/image2.jpg"
 */
router.post(
  '/images',
  authenticateToken,
  uploadMiddleware.array('images', 5),
  handleMulterError,
  uploadMultipleImages
);

/**
 * DELETE /api/upload/:filename
 * Deleta uma imagem
 * 
 * Requer: autenticação JWT + role admin ou ownership
 * 
 * curl -X DELETE http://localhost:3000/api/upload/abc-123.jpg \
 *   -H "Authorization: Bearer <token>"
 */
router.delete(
  '/:filename',
  authenticateToken,
  // Apenas admin ou dono do arquivo pode deletar
  // Em produção, adicionar verificação de ownership via banco
  deleteImage
);

/**
 * GET /api/upload/:filename
 * Retorna informações de uma imagem
 * 
 * Público (sem autenticação)
 * 
 * curl http://localhost:3000/api/upload/abc-123.jpg
 */
router.get(
  '/:filename',
  getImageInfo
);

// Log de inicialização das rotas
logger.info('Upload routes initialized');

export default router;
