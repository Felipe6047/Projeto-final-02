import { Router } from "express";
import { authRequired } from "../middleware/auth";
import { ok } from "../utils/http";
import * as campanhaService from "../services/campanha.service";

const router = Router();

router.use(authRequired);

router.get("/ativas", async (req, res, next) => {
  try {
    const campanhas = await campanhaService.listarCampanhasAtivas(req.user!.id);
    return ok(res, campanhas);
  } catch (e) {
    next(e);
  }
});

export default router;
