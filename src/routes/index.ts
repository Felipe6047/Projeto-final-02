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

// 🌱 Endpoint PÚBLICO para verificar se o seed foi aplicado
router.get("/health/seed", async (_req, res) => {
  try {
    if (!AppDataSource.isInitialized) {
      return res.status(503).json({ 
        status: "error", 
        message: "Database not initialized",
        seed: { applied: false }
      });
    }

    const { NivelFidelidade } = await import("../entities/NivelFidelidade");
    const { Usuario } = await import("../entities/Usuario");
    const { Produto } = await import("../entities/Produto");
    const { Conquista } = await import("../entities/Conquista");

    const nivelCount = await AppDataSource.getRepository(NivelFidelidade).count();
    const usuarioCount = await AppDataSource.getRepository(Usuario).count();
    const produtoCount = await AppDataSource.getRepository(Produto).count();
    const conquistaCount = await AppDataSource.getRepository(Conquista).count();

    const seedApplied = nivelCount > 0;

    return res.status(200).json({
      status: seedApplied ? "ok" : "warning",
      seed: {
        applied: seedApplied,
        data: {
          nivelFidelidade: nivelCount,
          usuarios: usuarioCount,
          produtos: produtoCount,
          conquistas: conquistaCount,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Seed check failed:", err);
    return res.status(500).json({
      status: "error",
      message: "Seed verification failed",
      error: err instanceof Error ? err.message : String(err),
      seed: { applied: false }
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
router.use("/mercado", mercadoRoutes);
router.use("/presentes", presentesRoutes);
router.use("/ranking", rankingRoutes);
router.use("/produtos", produtosRoutes);
router.use("/admin", adminRoutes);
router.use("/compra", compraRoutes);
router.use("/notificacoes", notificacaoRoutes);
router.use("/salas", salasRoutes);
router.use("/simulador-caixa", simuladorCaixaRoutes);
router.use("/missoes", missoesRoutes);
router.use("/campanhas", campanhasRoutes);
router.use("/amigos", amigosRoutes);
router.use("/enderecos", enderecoRoutes);
router.use("/cartoes", cartaoRoutes);

export default router;
