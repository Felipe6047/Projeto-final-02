import { Router } from "express";
import { z } from "zod";
import * as cupomService from "../services/cupom.service";
import { authRequired } from "../middleware/auth";
import { env } from "../config/env";
import { fail, ok } from "../utils/http";

const router = Router();

router.use(authRequired);

router.get("/meus-cupons", async (req, res, next) => {
  try {
    const cupons = await cupomService.listarMeusCupons(req.user!.id);
    return ok(res, cupons);
  } catch (e) {
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const cupons = await cupomService.listarMercado({
      categoria: req.query.categoria as string | undefined,
      valorMinimo: req.query.valorMinimo
        ? Number(req.query.valorMinimo)
        : undefined,
      busca: req.query.busca as string | undefined,
    });
    return ok(res, cupons);
  } catch (e) {
    next(e);
  }
});

router.get("/config", (_req, res) => {
  return ok(res, {
    diasMinimosValidade: 7,
    taxaTrocaPontos: env.taxaTrocaPontos,
  });
});

router.post("/oferecer/:cupomId", async (req, res, next) => {
  try {
    const result = await cupomService.oferecerParaTroca(
      req.user!.id,
      Number(req.params.cupomId)
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.post("/solicitar-troca", async (req, res, next) => {
  try {
    const body = z
      .object({
        cupomSolicitadoId: z.number().int().positive(),
        cupomOfertadoId: z.number().int().positive(),
        aceitarTaxa: z.boolean().default(false),
      })
      .parse(req.body);

    const result = await cupomService.solicitarTroca({
      solicitanteId: req.user!.id,
      ...body,
    });
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.patch("/propostas/:id", authRequired, async (req, res, next) => {
  try {
    const body = z.object({ aceitar: z.boolean() }).parse(req.body);
    const result = await cupomService.responderTroca(
      req.user!.id,
      Number(req.params.id),
      body.aceitar
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.get("/templates", async (_req, res, next) => {
  try {
    return ok(res, await cupomService.listarTemplatesParaResgate());
  } catch (e) {
    next(e);
  }
});

router.post("/resgatar/:templateId", async (req, res, next) => {
  try {
    const result = await cupomService.resgatarTemplateComPontos(
      req.user!.id,
      Number(req.params.templateId)
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.get("/historico", async (req, res, next) => {
  try {
    const historico = await cupomService.historicoTrocas(req.user!.id);
    return ok(res, historico);
  } catch (e) {
    next(e);
  }
});

export default router;
