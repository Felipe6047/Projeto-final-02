import type { IncomingMessage, ServerResponse } from "http";
import "reflect-metadata";
import app from "../src/app";
import { initializeDatabase } from "../src/config/database";

let databaseInit: Promise<void> | null = null;
let isWarmingUp = false;

async function ensureDatabase() {
  if (!databaseInit) {
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
    await ensureDatabase();
    
    // Aguardar um pouco para garantir que migrations completaram
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log("[FRIK] Database warm-up completed successfully");
  } catch (error) {
    console.error("[FRIK] Database warm-up failed:", error);
    isWarmingUp = false;
    throw error;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // Garantir que o banco está inicializado antes de qualquer requisição
    await ensureDatabase();
  } catch (error) {
    console.error("[FRIK] Erro ao inicializar o banco de dados:", error);
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
warmupDatabase().catch((err) => {
  console.error("[FRIK] Initial warm-up error (non-blocking):", err);
});
