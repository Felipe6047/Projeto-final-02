import { Router } from "express";
import { AppDataSource } from "../config/database";
import { openApiSpec } from "../swagger/openapi";
import authRoutes from "./auth.routes";
import mercadoRoutes from "./mercado.routes";
import presentesRoutes from "./presentes.routes";
import rankingRoutes from "./ranking.routes";
import produtosRoutes from "./produtos.routes";
import adminRoutes from "./admin.routes";
import compraRoutes from "./compra.routes";
import notificacaoRoutes from "./notificacao.routes";
import salasRoutes from "./salas.routes";
import simuladorCaixaRoutes from "./simulador-caixa.routes";
import missoesRoutes from "./missoes.routes";
import campanhasRoutes from "./campanhas.routes";
import amigosRoutes from "./amigos.routes";
import enderecoRoutes from "./endereco.routes";
import cartaoRoutes from "./cartao.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", projeto: "FRIK API" });
});

router.get("/health/db", async (_req, res) => {
  try {
    if (!AppDataSource.isInitialized) {
      return res.status(200).json({ status: "ok", db: "not-initialized" });
    }
    const result = await AppDataSource.query("SELECT VERSION() AS version");
    return res.status(200).json({ status: "ok", db: result[0] });
  } catch (err) {
    console.error("DB health check failed:", err);
    return res.status(500).json({ status: "ok", db: "error", error: String(err) });
  }
});

// Endpoint de diagnóstico para verificar schema e migrations
router.get("/health/schema", async (_req, res) => {
  try {
    if (!AppDataSource.isInitialized) {
      return res.status(500).json({ status: "error", message: "Database not initialized" });
    }

    // Listar tabelas
    const tables = await AppDataSource.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
    );

    // Listar migrations executadas
    const migrations = await AppDataSource.query(
      "SELECT migration FROM migrations ORDER BY timestamp"
    ).catch(() => []);

    return res.status(200).json({
      status: "ok",
      tables: tables.map((t: any) => t.TABLE_NAME),
      migrations: migrations.map((m: any) => m.migration),
      tableCount: tables.length,
    });
  } catch (err) {
    console.error("Schema check failed:", err);
    return res.status(500).json({
      status: "error",
      message: String(err),
      error: err instanceof Error ? err.message : undefined,
    });
  }
});

// Swagger JSON spec
router.get("/docs.json", (_req, res) => {
  const { openApiSpec } = require("../swagger/openapi");
  res.setHeader("Content-Type", "application/json");
  res.json(openApiSpec);
});

// Swagger UI HTML
router.get("/docs", (_req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>FRIK API — Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
    <style>
      html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
      * { box-sizing: inherit; }
      body { margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        const ui = SwaggerUIBundle({
          url: '/api/docs.json',
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          layout: 'BaseLayout',
          deepLinking: true,
          validatorUrl: null
        });
        window.ui = ui;
      };
    </script>
  </body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

router.use("/auth", authRoutes);
router.use("/campanhas", campanhasRoutes);
router.use("/amigos", amigosRoutes);
router.use("/enderecos", enderecoRoutes);

export default router;
