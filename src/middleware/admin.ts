import { Request, Response, NextFunction } from "express";
import { authRequired } from "./auth";

export function adminRequired(req: Request, res: Response, next: NextFunction) {
  if (req.user?.papel !== "admin") {
    return res.status(403).json({ erro: "Acesso restrito a administradores" });
  }
  return next();
}

export const adminAuth = [authRequired, adminRequired];
