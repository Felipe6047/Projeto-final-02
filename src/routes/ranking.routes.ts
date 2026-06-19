import { Router } from "express";
import * as rankingService from "../services/ranking.service";
import { authRequired } from "../middleware/auth";
import { fail, ok } from "../utils/http";

const router = Router();

router.get("/beneficios", async (_req, res, next) => {
  try {
    return ok(res, await rankingService.beneficiosPorNivel());
  } catch (e) {
    next(e);
  }
});

router.get("/mensal", async (req, res, next) => {
  try {
    const limite = req.query.limite ? Number(req.query.limite) : 10;
    return ok(res, await rankingService.rankingMensal(limite));
  } catch (e) {
    next(e);
  }
});

router.get("/trocas", async (req, res, next) => {
  try {
    const limite = req.query.limite ? Number(req.query.limite) : 10;
    return ok(res, await rankingService.rankingTrocas(limite));
  } catch (e) {
    next(e);
  }
});

router.get("/presentes", async (req, res, next) => {
  try {
    const limite = req.query.limite ? Number(req.query.limite) : 10;
    return ok(res, await rankingService.rankingPresentes(limite));
  } catch (e) {
    next(e);
  }
});

router.get("/conquistas-ranking", async (req, res, next) => {
  try {
    const limite = req.query.limite ? Number(req.query.limite) : 10;
    return ok(res, await rankingService.rankingConquistas(limite));
  } catch (e) {
    next(e);
  }
});

router.get("/global", async (req, res, next) => {
  try {
    const limite = req.query.limite ? Number(req.query.limite) : 50;
    return ok(res, await rankingService.rankingGlobal(limite));
  } catch (e) {
    next(e);
  }
});

router.get("/evento-ativo", async (_req, res, next) => {
  try {
    return ok(res, await rankingService.eventoAtivo());
  } catch (e) {
    next(e);
  }
});

router.get("/meu-nivel", authRequired, async (req, res, next) => {
  try {
    const nivel = await rankingService.meuNivel(req.user!.id);
    if (!nivel) return fail(res, "Usuário não encontrado", 404);
    return ok(res, nivel);
  } catch (e) {
    next(e);
  }
});

router.get("/conquistas", authRequired, async (req, res, next) => {
  try {
    const todas = req.query.todas === "1";
    if (todas) {
      return ok(res, await rankingService.todasConquistasComStatus(req.user!.id));
    }
    return ok(res, await rankingService.minhasConquistas(req.user!.id));
  } catch (e) {
    next(e);
  }
});

export default router;
