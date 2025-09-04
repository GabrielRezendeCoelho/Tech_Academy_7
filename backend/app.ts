import express from 'express';
import cors from 'cors';
import usersRoutes from './src/routes/userRoutes';
import sequelize from "./src/config/database";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', usersRoutes);

sequelize.sync({ alter: true })
  .then(() => {
    console.log("Banco de dados sincronizado com sucesso.");
  })
  .catch((error): any => {
    console.error("Erro ao sincronizar o banco de dados:", error);
  });

export default app;