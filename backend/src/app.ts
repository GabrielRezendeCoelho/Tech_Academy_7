import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import usersRoutes from "./routes/userRoutes";
import categoriaRoutes from "./routes/categoriaRoutes";
import saldoRoutes from "./routes/saldoRoutes";
import sequelize from "./config/database";

const app = express();

// CORS mais explícito (permite qualquer origem em dev). Ajustar para produção conforme necessidade.
app.use(
  cors({
    origin: (_origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json());

app.use("/users", usersRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/saldos", saldoRoutes);

// Serve OpenAPI/Swagger UI at /docs
try {
  const candidates = [
    path.resolve(__dirname, "..", "openapi.yaml"), // when running from src
    path.resolve(__dirname, "..", "..", "openapi.yaml"), // when running from dist/src
    path.resolve(process.cwd(), "openapi.yaml"), // fallback to working dir
  ];
  const swaggerPath = candidates.find((p) => fs.existsSync(p));
  if (!swaggerPath)
    throw new Error(
      `openapi.yaml não encontrado. Procurados: ${candidates.join(", ")}`
    );
  console.log("[SWAGGER] usando openapi.yaml em", swaggerPath);
  const swaggerDocument = YAML.load(swaggerPath as string);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.warn("Não foi possível carregar openapi.yaml para /docs:", err);
}

// Health check simples para testar conectividade via dispositivo móvel.
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Banco de dados sincronizado com sucesso.");
  })
  .catch((error): any => {
    console.error("Erro ao sincronizar o banco de dados:", error);
  });

// Middleware de tratamento de JSON inválido
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res
        .status(400)
        .json({ error: "JSON inválido no corpo da requisição." });
    }
    console.error("Erro não tratado:", err);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
);

export default app;
