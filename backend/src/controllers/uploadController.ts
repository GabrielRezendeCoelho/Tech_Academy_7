/**
 * Upload Controller - Image Upload Endpoints
 * 
 * Implementa endpoints para upload de imagens com validações completas.
 * 
 * Endpoints:
 * POST /api/upload/image - Upload de uma imagem
 * POST /api/upload/images - Upload de múltiplas imagens (até 5)
 * DELETE /api/upload/:filename - Deleta imagem
 * GET /api/upload/:filename - Retorna informações da imagem
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { 
  formatFileInfo, 
  deleteFile, 
  UPLOAD_CONFIG 
} from '../middleware/upload';

/**
 * Upload de imagem única
 * 
 * POST /api/upload/image
 * Content-Type: multipart/form-data
 * Body: { image: File }
 * 
 * Response: { success: true, file: { filename, url, size, ... } }
 */
export async function uploadSingleImage(req: Request, res: Response): Promise<void> {
  const requestId = (req as any).id || 'unknown';
  const userId = (req as any).user?.id;

  try {
    // Valida se arquivo foi enviado
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado. Use o campo "image" no form-data.'
      });
      return;
    }

    const fileInfo = formatFileInfo(req.file);

    logger.info(
      { 
        requestId, 
        userId, 
        filename: fileInfo.filename,
        size: fileInfo.size,
        mimetype: fileInfo.mimetype
      }, 
      'Image uploaded successfully'
    );

    res.status(201).json({
      success: true,
      message: 'Imagem enviada com sucesso',
      file: fileInfo
    });
  } catch (error) {
    logger.error({ error, requestId, userId }, 'Error uploading image');
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer upload da imagem'
    });
  }
}

/**
 * Upload de múltiplas imagens
 * 
 * POST /api/upload/images
 * Content-Type: multipart/form-data
 * Body: { images: File[] } (máximo 5)
 * 
 * Response: { success: true, files: [...], count: 3 }
 */
export async function uploadMultipleImages(req: Request, res: Response): Promise<void> {
  const requestId = (req as any).id || 'unknown';
  const userId = (req as any).user?.id;

  try {
    // Valida se arquivos foram enviados
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado. Use o campo "images" no form-data.'
      });
      return;
    }

    const filesInfo = (req.files as Express.Multer.File[]).map(formatFileInfo);

    logger.info(
      { 
        requestId, 
        userId, 
        count: filesInfo.length,
        totalSize: filesInfo.reduce((sum, file) => sum + file.size, 0)
      }, 
      'Multiple images uploaded successfully'
    );

    res.status(201).json({
      success: true,
      message: `${filesInfo.length} imagens enviadas com sucesso`,
      files: filesInfo,
      count: filesInfo.length
    });
  } catch (error) {
    logger.error({ error, requestId, userId }, 'Error uploading multiple images');
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer upload das imagens'
    });
  }
}

/**
 * Deleta imagem
 * 
 * DELETE /api/upload/:filename
 * Headers: { Authorization: Bearer <token> }
 * 
 * Response: { success: true, message: 'Imagem deletada' }
 */
export async function deleteImage(req: Request, res: Response): Promise<void> {
  const requestId = (req as any).id || 'unknown';
  const userId = (req as any).user?.id;
  const { filename } = req.params;

  try {
    // Valida filename
    if (!filename || filename.includes('..') || filename.includes('/')) {
      res.status(400).json({
        success: false,
        error: 'Nome de arquivo inválido'
      });
      return;
    }

    // Constrói caminho do arquivo (busca em subdiretórios por data)
    // Nota: em produção, armazenar filepath no banco de dados
    const filepath = `${UPLOAD_CONFIG.uploadDir}/${filename}`;
    
    deleteFile(filepath);

    logger.info(
      { requestId, userId, filename }, 
      'Image deleted'
    );

    res.json({
      success: true,
      message: 'Imagem deletada com sucesso'
    });
  } catch (error) {
    logger.error({ error, requestId, userId, filename }, 'Error deleting image');
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar imagem'
    });
  }
}

/**
 * Retorna informações de imagem
 * 
 * GET /api/upload/:filename
 * 
 * Response: { success: true, file: { filename, url, ... } }
 */
export async function getImageInfo(req: Request, res: Response): Promise<void> {
  const { filename } = req.params;

  try {
    // Valida filename
    if (!filename || filename.includes('..') || filename.includes('/')) {
      res.status(400).json({
        success: false,
        error: 'Nome de arquivo inválido'
      });
      return;
    }

    // Em produção, buscar do banco de dados
    // Por enquanto, retorna info básica
    const fs = require('fs');
    const path = require('path');
    const filepath = path.join(UPLOAD_CONFIG.uploadDir, filename);

    if (!fs.existsSync(filepath)) {
      res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
      return;
    }

    const stats = fs.statSync(filepath);
    const ext = path.extname(filename);
    
    res.json({
      success: true,
      file: {
        filename,
        size: stats.size,
        extension: ext,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      }
    });
  } catch (error) {
    logger.error({ error, filename }, 'Error getting image info');
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar informações da imagem'
    });
  }
}

/**
 * Error handler para erros do Multer
 */
export function handleMulterError(error: any, req: Request, res: Response, next: any): void {
  const requestId = (req as any).id || 'unknown';

  if (error) {
    logger.error({ error, requestId }, 'Multer error');

    // Erros específicos do Multer
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: `Arquivo muito grande. Tamanho máximo: ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB`
      });
      return;
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: 'Muitos arquivos. Máximo: 10 arquivos por vez'
      });
      return;
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        error: 'Campo de arquivo inesperado. Use "image" ou "images"'
      });
      return;
    }

    // Erro genérico
    res.status(400).json({
      success: false,
      error: error.message || 'Erro ao fazer upload'
    });
    return;
  }

  next();
}
