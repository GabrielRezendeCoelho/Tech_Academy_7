/**
 * File Upload Middleware - Multer Configuration
 * 
 * Implementa upload de arquivos/imagens com validações:
 * - Validação de extensão (whitelist)
 * - Validação de tamanho máximo
 * - Prevenção de colisão de nomes (UUID + timestamp)
 * - Validação de MIME type
 * - Storage local ou S3 (configurável)
 * - Organização por data (uploads/2025/11/14/)
 * 
 * Uso:
 * router.post('/upload', uploadMiddleware.single('image'), uploadController);
 * router.post('/upload-multiple', uploadMiddleware.array('images', 5), uploadController);
 */

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { logger } from '../utils/logger';
import crypto from 'crypto';

// Configurações de upload
export const UPLOAD_CONFIG = {
  // Tamanho máximo por arquivo (5MB)
  maxFileSize: 5 * 1024 * 1024,
  
  // Extensões permitidas para imagens
  allowedImageExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  
  // MIME types permitidos
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  
  // Diretório base para uploads
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  
  // Usar S3 ou storage local
  useS3: process.env.USE_S3_STORAGE === 'true',
  s3Bucket: process.env.S3_BUCKET_NAME
};

/**
 * Garante que diretório de upload existe
 */
function ensureUploadDirExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info({ dir }, 'Upload directory created');
  }
}

/**
 * Gera nome de arquivo único para prevenir colisão
 * Formato: {uuid}-{timestamp}-{originalname}
 */
function generateUniqueFilename(originalname: string): string {
  const uuid = crypto.randomUUID();
  const timestamp = Date.now();
  const ext = path.extname(originalname);
  const basename = path.basename(originalname, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 50); // Limita tamanho do nome original

  return `${uuid}-${timestamp}-${basename}${ext}`;
}

/**
 * Gera subdiretório baseado na data (uploads/2025/11/14/)
 */
function getDateBasedPath(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return path.join(year.toString(), month, day);
}

/**
 * Storage configuração - Local Disk
 */
const diskStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    try {
      // Organiza por data: uploads/2025/11/14/
      const dateBasedPath = getDateBasedPath();
      const uploadPath = path.join(UPLOAD_CONFIG.uploadDir, dateBasedPath);
      
      ensureUploadDirExists(uploadPath);
      
      logger.debug({ uploadPath, filename: file.originalname }, 'File destination set');
      cb(null, uploadPath);
    } catch (error) {
      logger.error({ error }, 'Error setting upload destination');
      cb(error as Error, '');
    }
  },
  
  filename: (req: Request, file: Express.Multer.File, cb) => {
    try {
      const uniqueFilename = generateUniqueFilename(file.originalname);
      
      logger.debug(
        { 
          original: file.originalname, 
          generated: uniqueFilename,
          mimetype: file.mimetype
        }, 
        'File renamed'
      );
      
      cb(null, uniqueFilename);
    } catch (error) {
      logger.error({ error }, 'Error generating filename');
      cb(error as Error, '');
    }
  }
});

/**
 * File filter - Validação de tipo de arquivo
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype.toLowerCase();

  // Validação de extensão
  if (!UPLOAD_CONFIG.allowedImageExtensions.includes(ext)) {
    logger.warn(
      { 
        filename: file.originalname, 
        extension: ext,
        allowedExtensions: UPLOAD_CONFIG.allowedImageExtensions
      }, 
      'File rejected: invalid extension'
    );
    
    return cb(
      new Error(
        `Extensão não permitida. Permitidas: ${UPLOAD_CONFIG.allowedImageExtensions.join(', ')}`
      )
    );
  }

  // Validação de MIME type
  if (!UPLOAD_CONFIG.allowedMimeTypes.includes(mimetype)) {
    logger.warn(
      { 
        filename: file.originalname, 
        mimetype,
        allowedMimeTypes: UPLOAD_CONFIG.allowedMimeTypes
      }, 
      'File rejected: invalid MIME type'
    );
    
    return cb(
      new Error(
        `Tipo de arquivo não permitido. Permitidos: ${UPLOAD_CONFIG.allowedMimeTypes.join(', ')}`
      )
    );
  }

  logger.debug(
    { 
      filename: file.originalname, 
      extension: ext, 
      mimetype 
    }, 
    'File validation passed'
  );

  cb(null, true);
};

/**
 * Multer instance - Upload Middleware
 */
export const uploadMiddleware = multer({
  storage: diskStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.maxFileSize,
    files: 10 // Máximo de 10 arquivos por vez
  }
});

/**
 * Helper: Deleta arquivo do disco
 */
export function deleteFile(filepath: string): void {
  try {
    const fullPath = path.join(process.cwd(), filepath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      logger.info({ filepath: fullPath }, 'File deleted');
    }
  } catch (error) {
    logger.error({ error, filepath }, 'Error deleting file');
  }
}

/**
 * Helper: Gera URL pública para arquivo uploadado
 */
export function getFileUrl(filepath: string): string {
  // Remove o diretório base
  const relativePath = filepath.replace(/\\/g, '/').replace(UPLOAD_CONFIG.uploadDir, '');
  
  // Gera URL baseada no ambiente
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/uploads${relativePath}`;
}

/**
 * Helper: Valida se arquivo é imagem válida (extensão + MIME)
 */
export function isValidImage(file: Express.Multer.File): boolean {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype.toLowerCase();
  
  return (
    UPLOAD_CONFIG.allowedImageExtensions.includes(ext) &&
    UPLOAD_CONFIG.allowedMimeTypes.includes(mimetype)
  );
}

/**
 * Helper: Formata informações do arquivo para response
 */
export function formatFileInfo(file: Express.Multer.File): {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  path: string;
} {
  return {
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: getFileUrl(file.path),
    path: file.path
  };
}

// Inicializa diretório de uploads
ensureUploadDirExists(UPLOAD_CONFIG.uploadDir);
