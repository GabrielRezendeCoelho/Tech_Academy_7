import express from 'express';
import cors from 'cors';
import usersRoutes from './routes/userRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import saldoRoutes from './routes/saldoRoutes';
import sequelize from "./config/database";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', usersRoutes);
app.use('/categorias', categoriaRoutes);
app.use('/saldos', saldoRoutes);

sequelize.sync({ alter: true })
  .then(() => {
    console.log("Banco de dados sincronizado com sucesso.");
  })
  .catch((error): any => {
    console.error("Erro ao sincronizar o banco de dados:", error);
  });

export default app;