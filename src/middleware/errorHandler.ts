import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      erro: "Dados inválidos",
      detalhes: err.flatten().fieldErrors,
    });
  }

  // Log detalhado do erro
  console.error("[FRIK] Error:", {
    name: err instanceof Error ? err.name : "Unknown",
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  // Em desenvolvimento, expor mais detalhes
  if (env.nodeEnv === "development") {
    return res.status(500).json({
      erro: "Erro interno do servidor",
      detalhes: err instanceof Error ? err.message : String(err),
    });
  }

  // Em produção, mensagem genérica
  return res.status(500).json({ erro: "Erro interno do servidor" });
}
