"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSaldo = exports.updateSaldo = exports.getSaldo = exports.listSaldos = exports.createSaldo = exports.getSaldoUsuario = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Retorna o saldo do usuário autenticado
const getSaldoUsuario = async (req, res) => {
    try {
        // Extrai o token do header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ error: 'Token não fornecido' });
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secreta');
        const userId = decoded.id;
        // Busca o saldo do usuário
        const saldo = await saldoModel_1.default.findAll({ where: { userId } });
        res.json(saldo);
    }
    catch (err) {
        res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};
exports.getSaldoUsuario = getSaldoUsuario;
const saldoModel_1 = __importDefault(require("../models/saldoModel"));
const createSaldo = async (req, res) => {
    const { valor, userId, categoriaId, data, origem } = req.body;
    if (!valor || !userId || !categoriaId) {
        return res.status(400).json({ error: 'Valor, userId e categoriaId são obrigatórios.' });
    }
    try {
        const saldo = await saldoModel_1.default.create({ valor, userId, categoriaId, data, origem });
        res.status(201).json(saldo);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao criar saldo', details: err });
    }
};
exports.createSaldo = createSaldo;
const listSaldos = async (_req, res) => {
    try {
        const saldos = await saldoModel_1.default.findAll();
        res.json(saldos);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao buscar saldos', details: err });
    }
};
exports.listSaldos = listSaldos;
const getSaldo = async (req, res) => {
    const { id } = req.params;
    try {
        const saldo = await saldoModel_1.default.findByPk(Number(id));
        if (!saldo)
            return res.status(404).json({ error: 'Saldo não encontrado' });
        res.json(saldo);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao buscar saldo', details: err });
    }
};
exports.getSaldo = getSaldo;
const updateSaldo = async (req, res) => {
    const { id } = req.params;
    const { valor, userId, categoriaId, data } = req.body;
    try {
        const saldo = await saldoModel_1.default.findByPk(Number(id));
        if (!saldo)
            return res.status(404).json({ error: 'Saldo não encontrado' });
        await saldo.update({ valor, userId, categoriaId, data });
        res.json(saldo);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar saldo', details: err });
    }
};
exports.updateSaldo = updateSaldo;
const deleteSaldo = async (req, res) => {
    const { id } = req.params;
    try {
        const saldo = await saldoModel_1.default.findByPk(Number(id));
        if (!saldo)
            return res.status(404).json({ error: 'Saldo não encontrado' });
        await saldo.destroy();
        res.json({ message: 'Saldo deletado com sucesso' });
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao deletar saldo', details: err });
    }
};
exports.deleteSaldo = deleteSaldo;
