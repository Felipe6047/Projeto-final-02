import { Router } from "express";
import * as notificacaoService from "../services/notificacao.service";
import { authRequired } from "../middleware/auth";
import { fail, ok } from "../utils/http";

const router = Router();

router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    const apenasNaoLidas = req.query.apenasNaoLidas === "1";
    const [lista, naoLidas] = await Promise.all([
      notificacaoService.listarNotificacoes(req.user!.id, apenasNaoLidas),
      notificacaoService.contarNaoLidas(req.user!.id),
    ]);
    return ok(res, {
      notificacoes: lista.map((n) => ({
        id: n.id,
        titulo: n.titulo,
        mensagem: n.mensagem,
        tipo: n.tipo,
        lida: n.lida,
        criado_em: n.criadoEm,
      })),
      naoLidas,
    });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/lida", async (req, res, next) => {
  try {
    const ok_ = await notificacaoService.marcarComoLida(
      req.user!.id,
      req.params.id
    );
    if (!ok_) return fail(res, "Notificação não encontrada", 404);
    return ok(res, { lida: true });
  } catch (e) {
    next(e);
  }
});

router.patch("/lidas", async (req, res, next) => {
  try {
    const total = await notificacaoService.marcarTodasComoLidas(req.user!.id);
    return ok(res, { atualizadas: total });
  } catch (e) {
    next(e);
  }
});

export default router;
