import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

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

  console.error(err);
  return res.status(500).json({ erro: "Erro interno do servidor" });
}
