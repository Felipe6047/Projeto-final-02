import { Router } from "express";
import { z } from "zod";
import { AppDataSource } from "../config/database";
import { CartaoCredito } from "../entities/CartaoCredito";
import { authRequired } from "../middleware/auth";
import { ok, fail } from "../utils/http";

const router = Router();
router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    const repo = AppDataSource.getRepository(CartaoCredito);
    const cartoes = await repo.find({
      where: { usuarioId: req.user!.id },
      order: { principal: "DESC", id: "ASC" },
    });
    return ok(res, cartoes);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const schema = z.object({
      apelido: z.string().nullable().optional(),
      numero: z.string().length(19),
      nomeTitular: z.string().min(3),
      validade: z.string().length(5),
      cvv: z.string().min(3).max(4),
      principal: z.boolean().optional().default(false),
    });

    const body = schema.parse(req.body);
    const repo = AppDataSource.getRepository(CartaoCredito);

    if (body.principal) {
      await repo.update({ usuarioId: req.user!.id }, { principal: false });
    }

    const cartao = await repo.save({
      usuarioId: req.user!.id,
      ...body,
    });

    return ok(res, cartao, 201);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const schema = z.object({
      apelido: z.string().nullable().optional(),
      numero: z.string().length(19),
      nomeTitular: z.string().min(3),
      validade: z.string().length(5),
      cvv: z.string().min(3).max(4),
      principal: z.boolean().optional().default(false),
    });

    const body = schema.parse(req.body);
    const repo = AppDataSource.getRepository(CartaoCredito);

    const cartao = await repo.findOne({
      where: { id: Number(req.params.id), usuarioId: req.user!.id },
    });
    if (!cartao) return fail(res, "Cartão não encontrado", 404);

    if (body.principal) {
      await repo.update({ usuarioId: req.user!.id }, { principal: false });
    }

    await repo.update(cartao.id, body);
    return ok(res, { ...cartao, ...body });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const repo = AppDataSource.getRepository(CartaoCredito);
    const cartao = await repo.findOne({
      where: { id: Number(req.params.id), usuarioId: req.user!.id },
    });
    if (!cartao) return fail(res, "Cartão não encontrado", 404);

    await repo.remove(cartao);
    return ok(res, { message: "Cartão removido com sucesso" });
  } catch (e) {
    next(e);
  }
});

export default router;
