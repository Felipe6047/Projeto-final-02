import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { fail, ok } from "../utils/http";
import * as amigoService from "../services/amigo.service";

const router = Router();

router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    return ok(res, await amigoService.listarAmigos(req.user!.id));
  } catch (e) {
    next(e);
  }
});

router.get("/busca", async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "");
    return ok(res, await amigoService.buscarUsuariosSistema(q));
  } catch (e) {
    next(e);
  }
});

router.get("/:amigoId/endereco", async (req, res, next) => {
  try {
    const endereco = await amigoService.getEnderecoAmigo(
      Number(req.params.amigoId)
    );
    return ok(res, endereco);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = z.object({ amigoId: z.number().int().positive() }).parse(req.body);
    const result = await amigoService.adicionarAmigo(req.user!.id, body.amigoId);
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.delete("/:amigoId", async (req, res, next) => {
  try {
    const result = await amigoService.removerAmigo(
      req.user!.id,
      Number(req.params.amigoId)
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

export default router;
