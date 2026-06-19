import { Router } from "express";
import { authRequired } from "../middleware/auth";
import { ok } from "../utils/http";
import * as missaoService from "../services/missao.service";

const router = Router();

router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    const missoes = await missaoService.listarMissoesUsuario(req.user!.id);
    return ok(res, missoes);
  } catch (e) {
    next(e);
  }
});

export default router;
