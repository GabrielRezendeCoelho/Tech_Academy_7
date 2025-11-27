import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

// Diretório onde as imagens serão salvas
const uploadDir = path.join(__dirname, '../../uploads/profiles');

// Garantir que o diretório existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do storage do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para evitar colisão de nomes
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// Filtro para validar extensões de arquivo
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Extensões permitidas
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // MIME types permitidos
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Extensão de arquivo inválida. Permitidas: ${allowedExtensions.join(', ')}`));
  }
};

// Configuração do Multer
export const uploadProfilePhoto = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Tamanho máximo: 5MB
    files: 1 // Apenas 1 arquivo por vez
  }
});

// Middleware para tratar erros do Multer
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Arquivo muito grande. Tamanho máximo: 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Número de arquivos excedido. Envie apenas 1 arquivo.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Campo de arquivo inesperado. Use o campo "photo".'
      });
    }
    return res.status(400).json({
      error: `Erro no upload: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      error: err.message || 'Erro ao processar upload'
    });
  }
  
  next();
};

// Middleware para deletar foto antiga ao fazer upload de nova
export const deleteOldPhoto = async (photoUrl: string | null) => {
  if (!photoUrl) return;
  
  try {
    const filename = path.basename(photoUrl);
    const filePath = path.join(uploadDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Foto antiga deletada: ${filename}`);
    }
  } catch (error) {
    console.error('❌ Erro ao deletar foto antiga:', error);
  }
};
