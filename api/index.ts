import type { IncomingMessage, ServerResponse } from "http";
import "reflect-metadata";
import app from "../src/app";
import { initializeDatabase } from "../src/config/database";

let databaseInit: Promise<void> | null = null;

async function ensureDatabase() {
  if (!databaseInit) {
    databaseInit = initializeDatabase().catch((error) => {
      databaseInit = null;
      throw error;
    });
  }
  return databaseInit;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await ensureDatabase();
  } catch (error) {
    console.error("[FRIK] Falha ao inicializar a conexão com o banco de dados:", error);
    res.statusCode = 500;
    res.end("Internal Server Error");
    return;
  }

  return app(req as any, res as any);
}
