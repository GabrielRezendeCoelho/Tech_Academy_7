"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const yamljs_1 = __importDefault(require("yamljs"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const categoriaRoutes_1 = __importDefault(require("./routes/categoriaRoutes"));
const saldoRoutes_1 = __importDefault(require("./routes/saldoRoutes"));
const database_1 = __importDefault(require("./config/database"));
const app = (0, express_1.default)();
// CORS mais explícito (permite qualquer origem em dev). Ajustar para produção conforme necessidade.
app.use((0, cors_1.default)({
    origin: (_origin, callback) => callback(null, true),
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/users", userRoutes_1.default);
app.use("/categorias", categoriaRoutes_1.default);
app.use("/saldos", saldoRoutes_1.default);
// Serve OpenAPI/Swagger UI at /docs
try {
    const candidates = [
        path_1.default.resolve(__dirname, "..", "openapi.yaml"), // when running from src
        path_1.default.resolve(__dirname, "..", "..", "openapi.yaml"), // when running from dist/src
        path_1.default.resolve(process.cwd(), "openapi.yaml"), // fallback to working dir
    ];
    const swaggerPath = candidates.find((p) => fs_1.default.existsSync(p));
    if (!swaggerPath)
        throw new Error(`openapi.yaml não encontrado. Procurados: ${candidates.join(", ")}`);
    console.log("[SWAGGER] usando openapi.yaml em", swaggerPath);
    const swaggerDocument = yamljs_1.default.load(swaggerPath);
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
}
catch (err) {
    console.warn("Não foi possível carregar openapi.yaml para /docs:", err);
}
// Health check simples para testar conectividade via dispositivo móvel.
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
database_1.default
    .sync({ alter: true })
    .then(() => {
    console.log("Banco de dados sincronizado com sucesso.");
})
    .catch((error) => {
    console.error("Erro ao sincronizar o banco de dados:", error);
});
// Middleware de tratamento de JSON inválido
app.use((err, _req, res, _next) => {
    if (err instanceof SyntaxError && "body" in err) {
        return res
            .status(400)
            .json({ error: "JSON inválido no corpo da requisição." });
    }
    console.error("Erro não tratado:", err);
    return res.status(500).json({ error: "Erro interno do servidor." });
});
exports.default = app;
