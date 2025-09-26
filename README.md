# Kash

## Sobre o projeto

**Kash** é um aplicativo web/mobile para controle financeiro pessoal, desenvolvido para facilitar o acompanhamento de saldo, despesas, histórico de movimentações e gestão de perfil do usuário. O sistema permite cadastrar, editar e excluir movimentações financeiras, visualizar gráficos e alertas sobre gastos excessivos, além de oferecer uma interface intuitiva e responsiva.

## Funcionalidades principais

- **Dashboard:** Exibe o saldo total, despesas, porcentagem de gastos e alertas de situação financeira.
- **Despesas:** Cadastro, edição, exclusão e filtro de despesas por data.
- **Saldo:** Adição, edição e exclusão de valores de saldo, com histórico detalhado.
- **Histórico:** Lista todas as movimentações (entradas e saídas) do usuário.
- **Perfil:** Visualização e edição dos dados do usuário.
- **Menu:** Navegação central para todas as áreas do app.
- **Cadastro/Login:** Autenticação de usuários com validação de senha e recuperação de acesso.
- **Alertas:** Notificações sobre ações e situações financeiras (ex: gastos excessivos).

## Tecnologias e linguagens utilizadas

- **Frontend:**  
  - [React Native](https://reactnative.dev/) (com Expo)
  - TypeScript
  - Expo Router
  - Styled Components e StyleSheet
  - Ícones: [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)
  - Async Storage

- **Backend:**  
  - Node.js
  - Express.js
  - TypeScript
  - Sequelize (ORM)
  - MySQL (banco de dados)
  - JWT (autenticação)

## Estrutura de pastas

- `frontend/app/` — Telas e componentes do aplicativo
- `frontend/assets/` — Imagens e ícones
- `backend/src/` — API, controllers, models e configuração do banco
- `backend/.env` — Configurações sensíveis (porta, credenciais do banco)

## Como rodar o projeto

1. **Backend**
   - Instale as dependências:  
     `npm install`
   - Configure o arquivo `.env` com os dados do banco.
   - Inicie o servidor:  
     `npm run dev`

2. **Frontend**
   - Instale as dependências:  
     `npm install`
   - Inicie o app com Expo:  
     `npx expo start`
   - Acesse pelo navegador ou dispositivo móvel.

## Observações

- O Kash foi pensado para ser simples, rápido e seguro.
- O projeto pode ser expandido para incluir gráficos, notificações push e integração bancária.

---

**Desenvolvido usando React Native, Node.js, TypeScript e MySQL.**
