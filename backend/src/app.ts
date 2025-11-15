import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import usersRoutes from "./routes/userRoutes";
import categoriaRoutes from "./routes/categoriaRoutes";
import saldoRoutes from "./routes/saldoRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import sequelize from "./config/database";
import { connectRedis } from './config/redis';
import { requestLogger, logger } from './utils/logger';
import { metricsMiddleware, metricsEndpoint } from './middleware/metrics';
import { registerAllEventHandlers } from './domain/handlers/EventHandlers';
import { cacheManager } from './utils/cacheManager';
import { initializeEventSystem, shutdownEventSystem } from './utils/eventBusIntegration';

const app = express();

// Registra handlers de eventos de domínio
registerAllEventHandlers();
logger.info('Application initializing...');

// CORS mais explícito (permite qualquer origem em dev). Ajustar para produção conforme necessidade.
app.use(
  cors({
    origin: (_origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json());

// Middleware de logging e métricas
app.use(requestLogger);
app.use(metricsMiddleware);

app.use("/users", usersRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/saldos", saldoRoutes);
app.use("/api/upload", uploadRoutes);

// Serve arquivos estáticos de uploads (para acesso via URL)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

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

// Health check também disponível em /api/health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Endpoint de métricas Prometheus
app.get("/metrics", metricsEndpoint);

sequelize
  .sync({ alter: true })
  .then(async () => {
    logger.info("Banco de dados sincronizado com sucesso.");
    
    // Conectar ao Redis após sincronizar o DB
    try {
      await connectRedis();
      logger.info('Redis conectado.');
      
      // Inicializa cache manager
      await cacheManager.connect(process.env.REDIS_URL);
      logger.info('Cache manager inicializado.');
      
      // Inicializa event bus (Pub/Sub)
      await initializeEventSystem(process.env.REDIS_URL);
      logger.info('Event bus inicializado.');
    } catch (err) {
      logger.warn({ error: err }, 'Falha ao inicializar Redis/Cache/EventBus. Continuando sem cache distribuído.');
    }
  })
  .catch((error): any => {
    logger.error({ error }, "Erro ao sincronizar o banco de dados:");
  });

// Middleware de tratamento de JSON inválido e erros gerais
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err instanceof SyntaxError && "body" in err) {
      logger.warn({ requestId: (req as any).requestId, error: err.message }, 'Invalid JSON in request body');
      return res
        .status(400)
        .json({ error: "JSON inválido no corpo da requisição." });
    }
    logger.error({ requestId: (req as any).requestId, error: err }, "Erro não tratado");
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  try {
    await cacheManager.disconnect();
    await shutdownEventSystem();
    await sequelize.close();
    logger.info('All connections closed.');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
});

export default app;
