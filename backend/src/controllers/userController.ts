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
import bcrypt from 'bcryptjs';
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
  } catch (err) {
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