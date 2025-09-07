import jwt from 'jsonwebtoken';
// Retorna o saldo do usuário autenticado
export const getSaldoUsuario = async (req: Request, res: Response) => {
  try {
    // Extrai o token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secreta');
    const userId = decoded.id;
    // Busca o saldo do usuário
    const saldo = await Saldo.findAll({ where: { userId } });
    res.json(saldo);
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
import { Request, Response } from 'express';
import Saldo from '../models/saldoModel';

export const createSaldo = async (req: Request, res: Response) => {
  const { valor, userId, categoriaId, data, origem } = req.body;
  if (!valor || !userId || !categoriaId) {
    return res.status(400).json({ error: 'Valor, userId e categoriaId são obrigatórios.' });
  }
  try {
    const saldo = await Saldo.create({ valor, userId, categoriaId, data, origem });
    res.status(201).json(saldo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar saldo', details: err });
  }
};

export const listSaldos = async (_req: Request, res: Response) => {
  try {
    const saldos = await Saldo.findAll();
    res.json(saldos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar saldos', details: err });
  }
};

export const getSaldo = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const saldo = await Saldo.findByPk(Number(id));
    if (!saldo) return res.status(404).json({ error: 'Saldo não encontrado' });
    res.json(saldo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar saldo', details: err });
  }
};

export const updateSaldo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { valor, userId, categoriaId, data } = req.body;
  try {
    const saldo = await Saldo.findByPk(Number(id));
    if (!saldo) return res.status(404).json({ error: 'Saldo não encontrado' });
    await saldo.update({ valor, userId, categoriaId, data });
    res.json(saldo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar saldo', details: err });
  }
};

export const deleteSaldo = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const saldo = await Saldo.findByPk(Number(id));
    if (!saldo) return res.status(404).json({ error: 'Saldo não encontrado' });
    await saldo.destroy();
    res.json({ message: 'Saldo deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar saldo', details: err });
  }
};
