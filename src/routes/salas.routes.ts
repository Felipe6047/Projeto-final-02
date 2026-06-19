import { Router } from "express";
import { z } from "zod";
import * as salaService from "../services/sala.service";
import * as cupomService from "../services/cupom.service";
import { authRequired } from "../middleware/auth";
import { fail, ok } from "../utils/http";

const router = Router();

router.get("/:codigo", async (req, res, next) => {
  try {
    const sala = await salaService.detalheSala(req.params.codigo);
    if (!sala) return fail(res, "Sala não encontrada", 404);
    return ok(res, sala);
  } catch (e) {
    next(e);
  }
});

router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    return ok(res, await salaService.listarMinhasSalas(req.user!.id));
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = z.object({ nome: z.string().min(2).max(80) }).parse(req.body);
    const result = await salaService.criarSala(req.user!.id, body.nome);
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.get("/:codigo/cupons-membros", async (req, res, next) => {
  try {
    const result = await salaService.listarCuponsMembrosSala(
      req.params.codigo,
      req.user!.id
    );
    if (!result) return fail(res, "Sala não encontrada", 404);
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.get("/:codigo/propostas", async (req, res, next) => {
  try {
    const result = await salaService.listarPropostasSala(
      req.params.codigo,
      req.user!.id
    );
    if (!result) return fail(res, "Sala não encontrada", 404);
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.post("/:codigo/propor-troca", async (req, res, next) => {
  try {
    const body = z
      .object({
        cupomOfertadoId: z.number().int().positive(),
        cupomSolicitadoId: z.number().int().positive(),
      })
      .parse(req.body);
    const result = await cupomService.proporTrocaSala(
      req.user!.id,
      body.cupomOfertadoId,
      body.cupomSolicitadoId,
      req.params.codigo
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.post("/:codigo/entrar", async (req, res, next) => {
  try {
    const result = await salaService.entrarSala(req.user!.id, req.params.codigo);
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.delete("/:codigo/sair", async (req, res, next) => {
  try {
    const result = await salaService.sairSala(req.user!.id, req.params.codigo);
    if (result && "erro" in result) return fail(res, result.erro!);
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

router.delete("/:codigo", async (req, res, next) => {
  try {
    const result = await salaService.excluirSala(req.user!.id, req.params.codigo);
    if (result && "erro" in result) return fail(res, result.erro!);
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
