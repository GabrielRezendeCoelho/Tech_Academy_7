"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.deleteUser = exports.updateUser = exports.getUser = exports.listUsers = exports.createUser = exports.loginUser = exports.updateUserByToken = exports.updateEmailByToken = exports.updatePasswordByToken = exports.deleteUserByToken = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Deletar usuário autenticado, exigindo senha
const deleteUserByToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ error: 'Token não fornecido' });
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secreta');
        }
        catch {
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }
        const userId = decoded.id;
        const { senha } = req.body;
        if (!senha)
            return res.status(400).json({ error: 'Senha obrigatória' });
        const user = await userModel_1.default.findByPk(userId);
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        const senhaCorreta = await bcryptjs_1.default.compare(senha, user.password);
        if (!senhaCorreta)
            return res.status(401).json({ error: 'Senha incorreta' });
        await user.destroy();
        res.json({ message: 'Usuário deletado com sucesso' });
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao deletar usuário', details: err });
    }
};
exports.deleteUserByToken = deleteUserByToken;
// Atualiza a senha do usuário autenticado
const updatePasswordByToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ error: 'Token não fornecido' });
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secreta');
        const userId = decoded.id;
        const { senhaAtual, novaSenha } = req.body;
        if (!senhaAtual || !novaSenha)
            return res.status(400).json({ error: 'Preencha todos os campos' });
        const user = await userModel_1.default.findByPk(userId);
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        const valid = await bcryptjs_1.default.compare(senhaAtual, user.password);
        if (!valid)
            return res.status(401).json({ error: 'Senha atual incorreta' });
        const hashedPassword = await bcryptjs_1.default.hash(novaSenha, 10);
        await user.update({ password: hashedPassword });
        res.json({ message: 'Senha alterada com sucesso!' });
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao alterar senha', details: err });
    }
};
exports.updatePasswordByToken = updatePasswordByToken;
// Atualiza email do usuário autenticado, exigindo senha
const updateEmailByToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ error: 'Token não fornecido' });
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secreta');
        const userId = decoded.id;
        const { email, senhaAtual } = req.body;
        if (!email || !senhaAtual)
            return res.status(400).json({ error: 'Email e senha atual são obrigatórios' });
        const user = await userModel_1.default.findByPk(userId);
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        const valid = await bcryptjs_1.default.compare(senhaAtual, user.password);
        if (!valid)
            return res.status(401).json({ error: 'Senha incorreta' });
        // Verifica se já existe outro usuário com o mesmo email
        const existing = await userModel_1.default.findOne({ where: { email } });
        if (existing && existing.id !== userId) {
            return res.status(400).json({ error: 'Já existe um usuário com este email.' });
        }
        await user.update({ email });
        res.json({ message: 'Email atualizado com sucesso', email: user.email });
    }
    catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Já existe um usuário com este email.' });
        }
        res.status(500).json({ error: 'Erro ao atualizar email', details: err });
    }
};
exports.updateEmailByToken = updateEmailByToken;
// Atualiza nome do usuário autenticado
const updateUserByToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ error: 'Token não fornecido' });
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secreta');
        const userId = decoded.id;
        const { name, email } = req.body;
        if (!name && !email)
            return res.status(400).json({ error: 'Nome ou email é obrigatório' });
        const user = await userModel_1.default.findByPk(userId);
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        if (email) {
            // Verifica se já existe outro usuário com o mesmo email
            const existing = await userModel_1.default.findOne({ where: { email } });
            if (existing && existing.id !== userId) {
                return res.status(400).json({ error: 'Já existe um usuário com este email.' });
            }
            await user.update({ email });
        }
        if (name) {
            await user.update({ name });
        }
        res.json({ message: 'Dados atualizados com sucesso', name: user.name, email: user.email });
    }
    catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Já existe um usuário com este email.' });
        }
        res.status(500).json({ error: 'Erro ao atualizar dados', details: err });
    }
};
exports.updateUserByToken = updateUserByToken;
// LOGIN
const loginUser = async (req, res) => {
    const rawBody = req.body;
    const email = rawBody.email;
    const password = rawBody.password || rawBody.senha; // aceita 'senha'
    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }
    try {
        console.log('[LOGIN] Tentativa de login para email:', email);
        const user = await userModel_1.default.findOne({ where: { email } });
        if (!user) {
            console.log('[LOGIN] Usuário não encontrado:', email);
            return res.status(401).json({ error: 'Usuário não encontrado.' });
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            console.log('[LOGIN] Senha inválida para usuário id', user.id);
            return res.status(401).json({ error: 'Senha inválida.' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secreta', { expiresIn: '1h' });
        console.log('[LOGIN] Sucesso para usuário id', user.id);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, cpf: user.cpf } });
    }
    catch (err) {
        console.error('[LOGIN] Erro inesperado', err);
        res.status(500).json({ error: 'Erro ao fazer login', details: err });
    }
};
exports.loginUser = loginUser;
const createUser = async (req, res) => {
    const { name, email, password, cpf } = req.body;
    if (!name || !email || !password || !cpf) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await userModel_1.default.create({ name, email, password: hashedPassword, cpf });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secreta', { expiresIn: '1h' });
        res.status(201).json({ user, token });
    }
    catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            const fields = err.errors.map((e) => e.path).join(' e ');
            return res.status(400).json({ error: `Já existe um usuário com este ${fields}.` });
        }
        res.status(500).json({ error: 'Erro ao criar usuário', details: err });
    }
};
exports.createUser = createUser;
const listUsers = async (req, res) => {
    try {
        const users = await userModel_1.default.findAll();
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao buscar usuários', details: err });
    }
};
exports.listUsers = listUsers;
const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userModel_1.default.findByPk(Number(id));
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao buscar usuário', details: err });
    }
};
exports.getUser = getUser;
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, cpf } = req.body;
    try {
        const user = await userModel_1.default.findByPk(Number(id));
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        await user.update({ name, email, password, cpf });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar usuário', details: err });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userModel_1.default.findByPk(Number(id));
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        await user.destroy();
        res.json({ message: 'Usuário deletado com sucesso' });
    }
    catch (err) {
        res.status(500).json({ error: 'Erro ao deletar usuário', details: err });
    }
};
exports.deleteUser = deleteUser;
// Redefine a senha do usuário pelo email
const resetPassword = async (req, res) => {
    const { email, novaSenha } = req.body;
    try {
        const user = await userModel_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(novaSenha, 10);
        user.password = hashedPassword;
        await user.save();
        return res.json({ message: 'Senha redefinida com sucesso!' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao redefinir senha.' });
    }
};
exports.resetPassword = resetPassword;
