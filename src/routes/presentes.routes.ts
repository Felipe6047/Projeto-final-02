import { Router } from "express";
import { z } from "zod";
import * as presenteService from "../services/presente.service";
import { authRequired } from "../middleware/auth";
import { fail, ok } from "../utils/http";

const router = Router();

router.get("/cupom/:codigo", async (req, res, next) => {
  try {
    const result = await presenteService.buscarPresentePorCodigo(req.params.codigo);
    if (!result) return fail(res, "Presente não encontrado", 404);
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.post("/cupom/:codigo/resgatar", authRequired, async (req, res, next) => {
  try {
    const result = await presenteService.resgatarPresenteCupom(
      req.user!.id,
      req.params.codigo
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.use(authRequired);

router.post("/cupom", async (req, res, next) => {
  try {
    const body = z
      .object({
        cupomId: z.number().int().positive(),
        canal: z.enum(["email", "whatsapp", "sms", "link"]),
        mensagem: z.string().max(200).optional(),
        destinatarioNome: z.string().optional(),
        destinatarioEmail: z.string().email().optional(),
        destinatarioTelefone: z.string().optional(),
        destinatarioCpf: z.string().length(11).optional(),
      })
      .parse(req.body);

    const result = await presenteService.presentearCupom({
      remetenteId: req.user!.id,
      ...body,
    });
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.post("/produto", async (req, res, next) => {
  try {
    const body = z
      .object({
        itens: z
          .array(
            z.object({
              produtoId: z.number().int().positive(),
              quantidade: z.number().int().positive(),
            })
          )
          .min(1),
        pontosUsados: z.number().int().nonnegative().default(0),
        valorReais: z.number().nonnegative(),
        walletUsado: z.number().nonnegative().optional(),
        valorPix: z.number().nonnegative().optional(),
        destinatario: z.object({
          nome: z.string().min(2),
          email: z.string().email().optional(),
          telefone: z.string().optional(),
          cpf: z.string().length(11).optional(),
          usuarioId: z.number().int().positive().optional(),
        }),
        endereco: z.record(z.unknown()),
        mensagem: z.string().max(500).optional(),
        embrulho: z.boolean().optional(),
        enviarSurpresa: z.boolean().optional(),
        isPessoal: z.boolean().optional(),
      })
      .parse(req.body);

    const result = await presenteService.criarPedidoPresente({
      remetenteId: req.user!.id,
      ...body,
    });
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.post("/pedidos/:id/confirmar-pagamento", async (req, res, next) => {
  try {
    const result = await presenteService.confirmarPagamentoPedido(
      req.user!.id,
      req.params.id
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.patch("/pedidos/:id/status", async (req, res, next) => {
  try {
    const result = await presenteService.avancarStatusPedido(
      req.user!.id,
      req.params.id
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.get("/pedidos", async (req, res, next) => {
  try {
    const pedidos = await presenteService.listarPedidosPresente(req.user!.id);
    return ok(res, pedidos);
  } catch (e) {
    next(e);
  }
});

export default router;
