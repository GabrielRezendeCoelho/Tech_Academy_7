
import bcrypt from 'bcryptjs';
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
    const user = await User.findByPk(userId);
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
    const user = await User.findByPk(userId);
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
    const user = await User.findByPk(userId);
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
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Senha inválida.' });
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secreta',
      { expiresIn: '1h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, cpf: user.cpf } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login', details: err });
  }
};
import { Request, Response } from 'express';
import User from '../models/userModel';

import jwt from 'jsonwebtoken';

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, cpf } = req.body;
  if (!name || !email || !password || !cpf) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, cpf });
    const token = jwt.sign(
      { id: user.id, email: user.email },
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
  const { name, email, password, cpf } = req.body;
  try {
    const user = await User.findByPk(Number(id));
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    await user.update({ name, email, password, cpf });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário', details: err });
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