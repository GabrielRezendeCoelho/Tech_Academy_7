const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const users = []; // Simulação de banco de dados
const historico = [
  { id: 1, tipo: 'Depósito', valor: 500, data: '2023-08-01' },
  { id: 2, tipo: 'Supermercado', valor: -150, data: '2023-08-02' },
  { id: 3, tipo: 'Transporte', valor: -30, data: '2023-08-03' },
  { id: 4, tipo: 'Depósito', valor: 2000, data: '2023-08-04' },
];
let saldo = 2500;
let alertas = { ativo: true };
let notificacoes = { notificacoes: true, emails: false, mensagens: true };
let gastosExcessivos = { limite: 2000, gastoAtual: 2500, alerta: true };

function passwordStrength(password) {
  let score = 0;
  if (!password) return 'Fraca';
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return 'Fraca';
  if (score === 2) return 'Média';
  return 'Forte';
}

// Cadastro
app.post('/register', async (req, res) => {
  const { name, email, cpf, password } = req.body;
  if (!name || !email || !cpf || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email já cadastrado' });
  }
  const hash = await bcrypt.hash(password, 10);
  users.push({ name, email, cpf, password: hash });
  res.json({ success: true });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Senha inválida' });
  const token = jwt.sign({ email: user.email }, 'secreta', { expiresIn: '1h' });
  res.json({ token, name: user.name });
});

// Força da senha
app.post('/password-strength', (req, res) => {
  const { password } = req.body;
  res.json({ strength: passwordStrength(password) });
});

// Perfil
app.get('/profile', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token ausente' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], 'secreta');
    const user = users.find(u => u.email === decoded.email);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ name: user.name, email: user.email, cpf: user.cpf });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Histórico
app.get('/historico', (req, res) => {
  res.json(historico);
});

// Saldo
app.get('/saldo', (req, res) => {
  res.json({ saldo });
});

// Alertas
app.get('/alertas', (req, res) => {
  res.json(alertas);
});
app.post('/alertas', (req, res) => {
  alertas = { ...alertas, ...req.body };
  res.json(alertas);
});

// Notificações
app.get('/notificacoes', (req, res) => {
  res.json(notificacoes);
});
app.post('/notificacoes', (req, res) => {
  notificacoes = { ...notificacoes, ...req.body };
  res.json(notificacoes);
});

// Gastos excessivos
app.get('/gastos-excessivos', (req, res) => {
  res.json(gastosExcessivos);
});
app.post('/gastos-excessivos', (req, res) => {
  gastosExcessivos = { ...gastosExcessivos, ...req.body };
  res.json(gastosExcessivos);
});

// Sobre (informativo)
app.get('/sobre', (req, res) => {
  res.json({
    texto: 'Nosso app ajuda você a controlar seu saldo, visualizar histórico, configurar alertas, notificações e muito mais. Gerencie suas finanças de forma simples e segura!'
  });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));