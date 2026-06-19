import { Router } from "express";
import { z } from "zod";
import * as authService from "../services/auth.service";
import { authRequired } from "../middleware/auth";
import { fail, ok } from "../utils/http";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
});

const registroSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  telefone: z.string().optional(),
  cpf: z.string().min(11).max(14),
});

router.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.senha);
    if (!result) return fail(res, "Credenciais inválidas", 401);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.post("/registro", async (req, res, next) => {
  try {
    const body = registroSchema.parse(req.body);
    const result = await authService.registrar({
      ...body,
      cpf: body.cpf.replace(/\D/g, ""),
    });
    if (!result) return fail(res, "Não foi possível registrar", 400);
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const body = registroSchema.parse(req.body);
    const result = await authService.registrar({
      ...body,
      cpf: body.cpf.replace(/\D/g, ""),
    });
    if (!result) return fail(res, "Não foi possível registrar", 400);
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.get("/perfil", authRequired, async (req, res, next) => {
  try {
    const perfil = await authService.buscarPerfil(req.user!.id);
    if (!perfil) return fail(res, "Usuário não encontrado", 404);
    return ok(res, perfil);
  } catch (e) {
    next(e);
  }
});

router.get("/buscar-usuarios", authRequired, async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "");
    const usuarios = await authService.buscarUsuarios(q);
    return ok(res, usuarios);
  } catch (e) {
    next(e);
  }
});

router.post("/kyc/verificar", authRequired, async (req, res, next) => {
  try {
    const result = await authService.verificarKyc(req.user!.id);
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.get("/extrato-wallet", authRequired, async (req, res, next) => {
  try {
    const { listarExtratoWallet } = await import("../services/wallet.service");
    const limite = Math.min(Number(req.query.limite) || 20, 50);
    const extrato = await listarExtratoWallet(req.user!.id, limite);
    return ok(res, extrato);
  } catch (e) {
    next(e);
  }
});

router.get("/historico-pontos", authRequired, async (req, res, next) => {
  try {
    const limite = Math.min(Number(req.query.limite) || 30, 100);
    const historico = await authService.historicoPontos(req.user!.id, limite);
    return ok(res, historico);
  } catch (e) {
    next(e);
  }
});

router.delete("/me", authRequired, async (req, res, next) => {
  try {
    const { AppDataSource } = await import("../config/database");
    const { Usuario } = await import("../entities/Usuario");
    await AppDataSource.getRepository(Usuario).delete(req.user!.id);
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
