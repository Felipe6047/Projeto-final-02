import type { IncomingMessage, ServerResponse } from "http";
import "reflect-metadata";
import app from "../src/app";
import { initializeDatabase } from "../src/config/database";

let databaseInit: Promise<void> | null = null;
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

async function ensureDatabase() {
  if (!databaseInit) {
    databaseInit = initializeDatabase().catch((error) => {
      initAttempts++;
      if (initAttempts < MAX_INIT_ATTEMPTS) {
        console.warn(`[FRIK] Database initialization failed (attempt ${initAttempts}/${MAX_INIT_ATTEMPTS}), will retry:`, error);
        databaseInit = null;
      } else {
        console.error(`[FRIK] Database initialization failed after ${MAX_INIT_ATTEMPTS} attempts:`, error);
      }
      throw error;
    });
  }
  return databaseInit;
}

// Warm-up function que AGUARDA tudo estar pronto antes de liberar
async function warmupDatabase() {
  const maxWarmupTime = 30000; // 30 segundos máximo
  const startTime = Date.now();

  try {
    console.log("[FRIK] === VERCEL COLD START DETECTED ===");
    console.log("[FRIK] Environment:", {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DB_HOST: process.env.DB_HOST || "not-set",
      DB_NAME: process.env.DB_NAME || "not-set",
    });
    
    console.log("[FRIK] Initializing database connection...");
    await ensureDatabase();
    console.log("[FRIK] ✓ Database connection established");
    
    // Aguardar mais um tempo para garantir que seed terminou
    console.log("[FRIK] Waiting for migrations and seed to complete...");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    const elapsed = Date.now() - startTime;
    console.log(`[FRIK] ✓ Cold start completed in ${elapsed}ms (migrations and seed ready)`);
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[FRIK] ✗ Cold start failed after ${elapsed}ms:`, error);
    console.error("[FRIK] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      code: error instanceof Error ? (error as any).code : undefined,
    });
    // NÃO rethrow - deixar prosseguir, a primeira requisição vai tentar again
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    console.log("[FRIK] Incoming request:", {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
    });

    // Garantir que o banco está inicializado
    await ensureDatabase();
    console.log("[FRIK] ✓ Database is ready");
  } catch (error) {
    console.error("[FRIK] ✗ Database initialization failed on request:", {
      error: error instanceof Error ? error.message : String(error),
      url: req.url,
    });
    
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      error: "Service Unavailable",
      message: "Database is not ready. Please try again in a few seconds.",
      details: error instanceof Error ? error.message : String(error),
    }));
    return;
  }

  // Rotear para Express
  return app(req as any, res as any);
}

// ========================================
// EXECUTA NO CARREGAMENTO DO MÓDULO (COLD START)
// ========================================
console.log("[FRIK] API handler loaded - initiating cold start warm-up...");
const warmupPromise = warmupDatabase();

// Garantir que não deixa a requisição prosseguir sem warm-up completar
warmupPromise.catch((err) => {
  console.error("[FRIK] Warning: warm-up failed, will retry on first request:", err);
});
