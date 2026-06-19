import { Router } from "express";
import { z } from "zod";
import * as simuladorService from "../services/simulador-caixa.service";
import { authRequired } from "../middleware/auth";
import { adminRequired } from "../middleware/admin";
import { fail, ok } from "../utils/http";

const router = Router();

router.use(authRequired, adminRequired);

// Buscar cliente por CPF (para o caixa verificar antes de cobrar)
router.get("/cliente/:cpf", async (req, res, next) => {
  try {
    const cpf = req.params.cpf.replace(/\D/g, "");
    if (cpf.length !== 11) return fail(res, "CPF inválido");
    const { AppDataSource } = await import("../config/database");
    const { Usuario } = await import("../entities/Usuario");
    const usuario = await AppDataSource.getRepository(Usuario)
      .createQueryBuilder("u")
      .leftJoin("u.nivel", "n")
      .select(["u.id", "u.nome", "u.email", "u.pontos"])
      .addSelect("n.nome", "nivel_nome")
      .where("u.cpf = :cpf", { cpf })
      .getRawOne();
    if (!usuario) return fail(res, "Nenhum cliente encontrado com este CPF");
    return ok(res, {
      id: usuario.u_id,
      nome: usuario.u_nome,
      email: usuario.u_email,
      pontos: usuario.u_pontos,
      nivel: usuario.nivel_nome ?? "Bronze",
    });
  } catch (e) {
    next(e);
  }
});

router.post("/venda", async (req, res, next) => {
  try {
    const body = z
      .object({
        cpf: z.string().min(11).max(14),
        valorTotal: z.number().positive(),
      })
      .parse(req.body);

    const cpf = body.cpf.replace(/\D/g, "");
    const result = await simuladorService.registrarVendaPorCpf(
      cpf,
      body.valorTotal
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.post("/nota", async (req, res, next) => {
  try {
    const body = z
      .object({
        valorTotal: z.number().positive(),
        cpf: z.string().min(11).max(14).optional(),
      })
      .parse(req.body);

    const result = await simuladorService.gerarNotaFiscal(
      body.valorTotal,
      body.cpf
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

export default router;
