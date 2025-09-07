import { Request, Response } from 'express';
import Categoria from '../models/categoriaModel';

export const createCategoria = async (req: Request, res: Response) => {
  const { nome, descricao } = req.body;
  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório.' });
  }
  try {
    const categoria = await Categoria.create({ nome, descricao });
    res.status(201).json(categoria);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar categoria', details: err });
  }
};

export const listCategorias = async (_req: Request, res: Response) => {
  try {
    const categorias = await Categoria.findAll();
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar categorias', details: err });
  }
};

export const getCategoria = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const categoria = await Categoria.findByPk(Number(id));
    if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json(categoria);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar categoria', details: err });
  }
};

export const updateCategoria = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, descricao } = req.body;
  try {
    const categoria = await Categoria.findByPk(Number(id));
    if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });
    await categoria.update({ nome, descricao });
    res.json(categoria);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar categoria', details: err });
  }
};

export const deleteCategoria = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const categoria = await Categoria.findByPk(Number(id));
    if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });
    await categoria.destroy();
    res.json({ message: 'Categoria deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar categoria', details: err });
  }
};
