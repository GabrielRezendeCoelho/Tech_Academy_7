"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoria = exports.updateCategoria = exports.getCategoria = exports.listCategorias = exports.createCategoria = void 0;
const categoriaModel_1 = __importDefault(require("../models/categoriaModel"));
const createCategoria = async (req, res) => {
    const { nome, descricao } = req.body;
    if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório.' });
    }
    try {
        const categoria = await categoriaModel_1.default.create({ nome, descricao });
        res.status(201).json(categoria);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao criar categoria', details: err });
    }
};
exports.createCategoria = createCategoria;
const listCategorias = async (_req, res) => {
    try {
        const categorias = await categoriaModel_1.default.findAll();
        res.json(categorias);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao buscar categorias', details: err });
    }
};
exports.listCategorias = listCategorias;
const getCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        const categoria = await categoriaModel_1.default.findByPk(Number(id));
        if (!categoria)
            return res.status(404).json({ error: 'Categoria não encontrada' });
        res.json(categoria);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao buscar categoria', details: err });
    }
};
exports.getCategoria = getCategoria;
const updateCategoria = async (req, res) => {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    try {
        const categoria = await categoriaModel_1.default.findByPk(Number(id));
        if (!categoria)
            return res.status(404).json({ error: 'Categoria não encontrada' });
        await categoria.update({ nome, descricao });
        res.json(categoria);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar categoria', details: err });
    }
};
exports.updateCategoria = updateCategoria;
const deleteCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        const categoria = await categoriaModel_1.default.findByPk(Number(id));
        if (!categoria)
            return res.status(404).json({ error: 'Categoria não encontrada' });
        await categoria.destroy();
        res.json({ message: 'Categoria deletada com sucesso' });
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao deletar categoria', details: err });
    }
};
exports.deleteCategoria = deleteCategoria;
