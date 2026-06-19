import type { IncomingMessage, ServerResponse } from "http";
import "reflect-metadata";
import app from "../src/app";
import { initializeDatabase } from "../src/config/database";

let databaseInit: Promise<void> | null = null;
let isWarmingUp = false;

async function ensureDatabase() {
  if (!databaseInit) {
    console.log("[FRIK] Starting database initialization in Vercel environment...");
    databaseInit = initializeDatabase().catch((error) => {
      console.error("[FRIK] Database initialization failed, will retry:", error);
      databaseInit = null;
      throw error;
    });
  }
  return databaseInit;
}

// Warm-up function para garantir que o banco está totalmente pronto
async function warmupDatabase() {
  if (isWarmingUp) return;
  isWarmingUp = true;

  try {
    console.log("[FRIK] Starting database warm-up...");
    console.log("[FRIK] Environment:", {
      NODE_ENV: process.env.NODE_ENV,
      DB_HOST: process.env.DB_HOST,
      DB_DATABASE: process.env.DB_NAME,
    });
    
    await ensureDatabase();
    
    // Aguardar um pouco para garantir que migrations e seed completaram
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    console.log("[FRIK] ✓ Database warm-up completed successfully (migrations and seed ready)");
  } catch (error) {
    console.error("[FRIK] Database warm-up failed:", error);
    console.error("[FRIK] Full error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    isWarmingUp = false;
    // Don't throw - log but continue, the first request will also try to init
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // Garantir que o banco está inicializado antes de qualquer requisição
    console.log("[FRIK] Incoming request - ensuring database is ready...");
    await ensureDatabase();
    console.log("[FRIK] ✓ Database is ready, routing request to Express app");
  } catch (error) {
    console.error("[FRIK] CRITICAL: Database initialization failed on request handler:", error);
    console.error("[FRIK] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      error: "Database initialization failed",
      message: error instanceof Error ? error.message : String(error),
    }));
    return;
  }

  // Rotear para Express
  return app(req as any, res as any);
}

// Chamar warm-up na importação do módulo (executa uma vez por cold start)
console.log("[FRIK] Vercel API handler module loaded - starting async warm-up");
warmupDatabase().catch((err) => {
  console.error("[FRIK] Initial warm-up error (non-blocking):", err);
});
