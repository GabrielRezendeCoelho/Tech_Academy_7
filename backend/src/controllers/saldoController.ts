import jwt from 'jsonwebtoken';
import redisClient from '../config/redis';
import { Request, Response } from 'express';
import Saldo from '../models/saldoModel';

// Helper de cache
const CACHE_TTL = Number(process.env.REDIS_CACHE_TTL || '60'); // segundos

async function getCache(key: string) {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.warn('Redis get error', err);
    return null;
  }
}

async function setCache(key: string, value: any, ttlSec = CACHE_TTL) {
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSec });
  } catch (err) {
    console.warn('Redis set error', err);
  }
}

async function delCache(keys: string | string[]) {
  try {
    if (Array.isArray(keys)) {
      if (keys.length === 0) return;
      await redisClient.del(keys);
    } else {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.warn('Redis del error', err);
  }
}

// Retorna o saldo do usuário autenticado (cache-aside)
export const getSaldoUsuario = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secreta');
    const userId = decoded.id;

    const cacheKey = `saldos:user:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const saldo = await Saldo.findAll({ where: { userId } });
    await setCache(cacheKey, saldo);
    res.json(saldo);
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export const createSaldo = async (req: Request, res: Response) => {
  const { valor, userId, categoriaId, data, origem } = req.body;
  if (!valor || !userId || !categoriaId) {
    return res.status(400).json({ error: 'Valor, userId e categoriaId são obrigatórios.' });
  }
  try {
    const saldo = await Saldo.create({ valor, userId, categoriaId, data, origem });
    // Invalidate related cache entries (user and all)
    const userKey = `saldos:user:${userId}`;
    await delCache([userKey, 'saldos:all']);
    res.status(201).json(saldo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar saldo', details: err });
  }
};

export const listSaldos = async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'saldos:all';
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const saldos = await Saldo.findAll();
    await setCache(cacheKey, saldos);
    res.json(saldos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar saldos', details: err });
  }
};

export const getSaldo = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const cacheKey = `saldo:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const saldo = await Saldo.findByPk(Number(id));
    if (!saldo) return res.status(404).json({ error: 'Saldo não encontrado' });
    await setCache(cacheKey, saldo);
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
    // Invalidate cache for this saldo and related user/all
    const keysToDel = [`saldo:${id}`, `saldos:user:${userId}`, 'saldos:all'];
    await delCache(keysToDel);
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
    // Invalidate cache
    await delCache([`saldo:${id}`, `saldos:user:${saldo.userId}`, 'saldos:all']);
    res.json({ message: 'Saldo deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar saldo', details: err });
  }
};
