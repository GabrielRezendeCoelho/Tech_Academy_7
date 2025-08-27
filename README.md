# Tech_Academy_7
## 💰 KASH - Aplicativo de Finanças Pessoais

O KASH é um aplicativo de finanças pessoais desenvolvido em React Native com Expo, com o objetivo de ajudar os usuários a organizar seus gastos, acompanhar entradas e saídas de dinheiro e ter maior controle sobre sua vida financeira.

## � Funcionalidades Implementadas

### Página HOME
- **Total Balance**: Exibe o saldo total disponível na conta
- **Income**: Visualização das receitas/rendas 
- **Expenses**: Visualização de todas as despesas
- **Transactions**: Lista completa de todas as transações (entradas e saídas)

### Exemplos de Transações
- ✅ **Shopping** - Exemplo de gasto (-$150.00)
- ✅ **Subscription** - Assinatura (-$30.00)  
- ✅ **Salary** - Salário (+$3,000.00)
- ✅ **Dining** - Alimentação (-$45.00)

## 🚀 Como Executar

### Pré-requisitos
- Node.js instalado
- Expo CLI: `npm install -g expo-cli`
- Expo Go app no seu dispositivo móvel

### Passos
1. Instale as dependências:
```bash
npm install --legacy-peer-deps
```

2. Inicie o servidor de desenvolvimento:
```bash
npm start
```

3. Escaneie o QR code com o app Expo Go ou execute em emulador

## 🛠️ Tecnologias Utilizadas

- **React Native** – Desenvolvimento mobile
- **Expo** – Gerenciamento e execução do app
- **TypeScript** – Tipagem e desenvolvimento
- **Context API** – Gerenciamento de estado
- **Feather Icons** – Ícones da interface

## 📂 Estrutura do Projeto

```
├── components/
│   ├── BalanceCard.tsx     # Card do saldo total
│   └── TransactionItem.tsx # Item individual de transação
├── context/
│   └── FinanceContext.tsx  # Context para dados financeiros
├── screens/
│   ├── HomeScreen.tsx      # Tela principal
│   └── LoginScreen.tsx     # Tela de login (futura)
├── types/
│   └── index.ts           # Definições de tipos
├── App.tsx                # Componente principal
└── package.json           # Dependências do projeto
```

## 🎨 Interface

A interface foi desenvolvida seguindo as melhores práticas de UX/UI:
- Design moderno e clean
- Cards com sombras suaves
- Cores intuitivas (verde para receitas, vermelho para despesas)
- Ícones representativos para cada categoria
- Layout responsivo e acessível

## 👨‍💻 Equipe de Desenvolvimento

- **Gabriel Rezende Coelho**
- **Marcos Vinicius Bartoli Senko** 
- **Lucas Koji Takahashi Maeda**

## 📋 Próximas Funcionalidades

- [ ] Sistema de autenticação completo
- [ ] Adicionar novas transações
- [ ] Gráficos e relatórios detalhados
- [ ] Categorização personalizada
- [ ] Metas financeiras
- [ ] Exportação de dados

---

*Desenvolvido como parte do Tech Academy 7*