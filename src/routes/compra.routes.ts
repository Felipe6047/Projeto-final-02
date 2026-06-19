import { Router } from "express";
import { z } from "zod";
import * as compraService from "../services/compra.service";
import * as notaFiscalService from "../services/nota-fiscal.service";
import { authRequired } from "../middleware/auth";
import { fail, ok } from "../utils/http";

const router = Router();

router.use(authRequired);

router.post("/", async (req, res, next) => {
  try {
    const body = z
      .object({
        valorTotal: z.number().positive(),
      })
      .parse(req.body);

    const result = await compraService.registrarCompra(
      req.user!.id,
      body.valorTotal
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.post("/nota-fiscal", async (req, res, next) => {
  try {
    const body = z
      .object({
        chave: z.string().length(44),
        vincularCpf: z.boolean().optional(),
      })
      .parse(req.body);

    const result = await notaFiscalService.processarNotaFiscal(
      req.user!.id,
      body.chave,
      body.vincularCpf
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const limite = req.query.limite ? Number(req.query.limite) : 20;
    const compras = await compraService.listarCompras(req.user!.id, limite);
    return ok(res, compras);
  } catch (e) {
    next(e);
  }
});

export default router;
