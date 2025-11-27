import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import User from '../models/userModel';
import jwt from 'jsonwebtoken';
import { deleteOldPhoto } from '../middleware/uploadMiddleware';
import path from 'path';


// Deletar usuário autenticado, exigindo senha
export const deleteUserByToken = async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });
    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreta');
    } catch {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    const userId = decoded.id;
    const { senha } = req.body;
    if (!senha) return res.status(400).json({ error: 'Senha obrigatória' });
    const user = await User.scope('withPassword').findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    const senhaCorreta = await bcrypt.compare(senha, user.password);
    if (!senhaCorreta) return res.status(401).json({ error: 'Senha incorreta' });
    await user.destroy();
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar usuário', details: err });
  }
};
// Atualiza a senha do usuário autenticado
export const updatePasswordByToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secreta');
    const userId = decoded.id;
    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha) return res.status(400).json({ error: 'Preencha todos os campos' });
    const user = await User.scope('withPassword').findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    const valid = await bcrypt.compare(senhaAtual, user.password);
    if (!valid) return res.status(401).json({ error: 'Senha atual incorreta' });
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    await user.update({ password: hashedPassword });
    res.json({ message: 'Senha alterada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao alterar senha', details: err });
  }
};
// Atualiza email do usuário autenticado, exigindo senha
export const updateEmailByToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secreta');
    const userId = decoded.id;
    const { email, senhaAtual } = req.body;
    if (!email || !senhaAtual) return res.status(400).json({ error: 'Email e senha atual são obrigatórios' });
    const user = await User.scope('withPassword').findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    const valid = await bcrypt.compare(senhaAtual, user.password);
    if (!valid) return res.status(401).json({ error: 'Senha incorreta' });
    // Verifica se já existe outro usuário com o mesmo email
    const existing = await User.findOne({ where: { email } });
    if (existing && existing.id !== userId) {
      return res.status(400).json({ error: 'Já existe um usuário com este email.' });
    }
    await user.update({ email });
    res.json({ message: 'Email atualizado com sucesso', email: user.email });
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Já existe um usuário com este email.' });
    }
    res.status(500).json({ error: 'Erro ao atualizar email', details: err });
  }
};
// Atualiza nome do usuário autenticado
export const updateUserByToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secreta');
    const userId = decoded.id;
    const { name, email } = req.body;
    if (!name && !email) return res.status(400).json({ error: 'Nome ou email é obrigatório' });
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    if (email) {
      // Verifica se já existe outro usuário com o mesmo email
      const existing = await User.findOne({ where: { email } });
      if (existing && existing.id !== userId) {
        return res.status(400).json({ error: 'Já existe um usuário com este email.' });
      }
      await user.update({ email });
    }
    if (name) {
      await user.update({ name });
    }
    res.json({ message: 'Dados atualizados com sucesso', name: user.name, email: user.email });
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Já existe um usuário com este email.' });
    }
    res.status(500).json({ error: 'Erro ao atualizar dados', details: err });
  }
};
// LOGIN
export const loginUser = async (req: Request, res: Response) => {
  const rawBody = req.body;
  const email = rawBody.email;
  const password = rawBody.password || rawBody.senha; // aceita 'senha'
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }
  try {
    console.log('[LOGIN] Tentativa de login para email:', email);
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      console.log('[LOGIN] Usuário não encontrado:', email);
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('[LOGIN] Senha inválida para usuário id', user.id);
      return res.status(401).json({ error: 'Senha inválida.' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secreta',
      { expiresIn: '1h' }
    );
    console.log('[LOGIN] Sucesso para usuário id', user.id);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        cpf: user.cpf, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('[LOGIN] Erro inesperado', err);
    res.status(500).json({ error: 'Erro ao fazer login', details: err });
  }
};
export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, cpf, role } = req.body;
  if (!name || !email || !password || !cpf) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Role padrão é 'user', mas pode ser 'admin' se passado no body
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      cpf,
      role: role || 'user' // Default 'user'
    });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secreta',
      { expiresIn: '1h' }
    );
    res.status(201).json({ user, token });
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      const fields = err.errors.map((e: any) => e.path).join(' e ');
      return res.status(400).json({ error: `Já existe um usuário com este ${fields}.` });
    }
    res.status(500).json({ error: 'Erro ao criar usuário', details: err });
  }
};

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários', details: err });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(Number(id));
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário', details: err });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, cpf, role } = req.body;
  try {
    const user = await User.findByPk(Number(id));
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    const updateData: any = { name, email, cpf };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (role) {
      updateData.role = role;
    }
    
    await user.update(updateData);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário', details: err });
  }
};

// Admin: Criar usuário admin
export const createAdmin = async (req: Request, res: Response) => {
  const { name, email, password, cpf } = req.body;
  if (!name || !email || !password || !cpf) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      cpf,
      role: 'admin' // Força role admin
    });
    res.status(201).json({ 
      message: 'Admin criado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      const fields = err.errors.map((e: any) => e.path).join(' e ');
      return res.status(400).json({ error: `Já existe um usuário com este ${fields}.` });
    }
    res.status(500).json({ error: 'Erro ao criar admin', details: err });
  }
};

// Admin: Promover usuário a admin
export const promoteToAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(Number(id));
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    await user.update({ role: 'admin' });
    res.json({ 
      message: 'Usuário promovido a admin com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao promover usuário', details: err });
  }
};

// Admin: Rebaixar admin para usuário comum
export const demoteFromAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(Number(id));
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    await user.update({ role: 'user' });
    res.json({ 
      message: 'Admin rebaixado para usuário comum',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao rebaixar admin', details: err });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(Number(id));
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    await user.destroy();
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar usuário', details: err });
  }
};
// Redefine a senha do usuário pelo email
export const resetPassword = async (req: Request, res: Response) => {
  const { email, novaSenha } = req.body;
  try {
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    user.password = hashedPassword;
    await user.save();
    return res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao redefinir senha.' });
  }
};

// Obter dados do usuário autenticado
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      role: user.role,
      photoUrl: user.photoUrl
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do usuário', details: error });
  }
};


// Upload de foto de perfil
export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Deletar foto antiga se existir
    if (user.photoUrl) {
      await deleteOldPhoto(user.photoUrl);
    }

    // Salvar URL da nova foto
    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    await user.update({ photoUrl });

    console.log(`✅ Foto de perfil atualizada para usuário ${userId}`);
    
    res.json({ 
      message: 'Foto de perfil atualizada com sucesso',
      photoUrl: photoUrl,
      fileInfo: {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('❌ Erro ao fazer upload da foto:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da foto', details: error });
  }
};

// Deletar foto de perfil
export const deleteProfilePhoto = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (!user.photoUrl) {
      return res.status(400).json({ error: 'Usuário não possui foto de perfil' });
    }

    // Deletar foto
    await deleteOldPhoto(user.photoUrl);
    await user.update({ photoUrl: null });

    console.log(`✅ Foto de perfil deletada para usuário ${userId}`);
    
    res.json({ message: 'Foto de perfil deletada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar foto:', error);
    res.status(500).json({ error: 'Erro ao deletar foto de perfil', details: error });
  }
};

// Admin: Ver foto de qualquer usuário
export const getUserPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(Number(id));
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (!user.photoUrl) {
      return res.status(404).json({ error: 'Usuário não possui foto de perfil' });
    }

    res.json({ 
      photoUrl: user.photoUrl,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar foto do usuário', details: error });
  }
};
