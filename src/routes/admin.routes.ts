import { Router } from "express";
import { z } from "zod";
import { adminAuth } from "../middleware/admin";
import * as adminService from "../services/admin.service";
import { fail, ok } from "../utils/http";

const router = Router();
router.use(...adminAuth);

const campanhaSchema = z.object({
  titulo: z.string().min(2),
  descricao: z.string().optional(),
  segmento_json: z.record(z.unknown()).optional(),
  inicio_em: z.string(),
  fim_em: z.string(),
  ativa: z.boolean().optional(),
});

const cupomTemplateSchema = z.object({
  titulo: z.string().min(2),
  descricao: z.string().optional(),
  categoria: z.string().min(1),
  desconto_percentual: z.number().optional(),
  desconto_valor: z.number().optional(),
  valor_minimo_compra: z.number().optional(),
  dias_validade: z.number().int().positive().optional(),
  ativo: z.boolean().optional(),
  limite_por_usuario: z.number().int().positive().optional(),
  limite_total: z.number().int().positive().optional(),
});

const produtoSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  preco_reais: z.number().positive(),
  preco_pontos: z.number().int().nonnegative(),
  estoque: z.number().int().nonnegative().optional(),
  ativo: z.boolean().optional(),
});

const missaoSchema = z.object({
  titulo: z.string().min(2),
  descricao: z.string().optional(),
  pontos_recompensa: z.number().int().positive(),
  meta_valor: z.number().int().positive().optional(),
  tipo_meta: z.enum(["compras", "trocas", "presentes", "pontos"]),
  ativa: z.boolean().optional(),
  inicio_em: z.string().optional(),
  fim_em: z.string().optional(),
});

const eventoSchema = z.object({
  titulo: z.string().min(2),
  descricao: z.string().optional(),
  trocas_extras: z.number().int().nonnegative().optional(),
  inicio_em: z.string(),
  fim_em: z.string(),
  ativa: z.boolean().optional(),
});

router.get("/dashboard", async (_req, res, next) => {
  try {
    return ok(res, await adminService.getDashboard());
  } catch (e) {
    next(e);
  }
});

router.get("/relatorios/segmentacao", async (_req, res, next) => {
  try {
    return ok(res, await adminService.getSegmentacao());
  } catch (e) {
    next(e);
  }
});

// Campanhas
router.get("/campanhas", async (_req, res, next) => {
  try {
    return ok(res, await adminService.listarCampanhas());
  } catch (e) {
    next(e);
  }
});

router.post("/campanhas", async (req, res, next) => {
  try {
    const body = campanhaSchema.parse(req.body);
    const id = await adminService.criarCampanha(body);
    return ok(res, { id }, 201);
  } catch (e) {
    next(e);
  }
});

router.put("/campanhas/:id", async (req, res, next) => {
  try {
    const body = campanhaSchema.partial().parse(req.body);
    const okUpdate = await adminService.atualizarCampanha(
      Number(req.params.id),
      body
    );
    if (!okUpdate) return fail(res, "Campanha não encontrada", 404);
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

router.delete("/campanhas/:id", async (req, res, next) => {
  try {
    const okDel = await adminService.excluirCampanha(Number(req.params.id));
    if (!okDel) return fail(res, "Campanha não encontrada", 404);
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

// Cupom templates
router.get("/cupom-templates", async (_req, res, next) => {
  try {
    return ok(res, await adminService.listarCupomTemplates());
  } catch (e) {
    next(e);
  }
});

router.post("/cupom-templates", async (req, res, next) => {
  try {
    const body = cupomTemplateSchema.parse(req.body);
    const id = await adminService.criarCupomTemplate(body);
    return ok(res, { id }, 201);
  } catch (e) {
    next(e);
  }
});

router.put("/cupom-templates/:id", async (req, res, next) => {
  try {
    const body = cupomTemplateSchema.partial().parse(req.body);
    const okUpdate = await adminService.atualizarCupomTemplate(
      Number(req.params.id),
      body
    );
    if (!okUpdate) return fail(res, "Template não encontrado", 404);
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

router.delete("/cupom-templates/:id", async (req, res, next) => {
  try {
    const okDel = await adminService.excluirCupomTemplate(Number(req.params.id));
    if (!okDel) return fail(res, "Template não encontrado", 404);
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

// Produtos
router.get("/produtos", async (_req, res, next) => {
  try {
    return ok(res, await adminService.listarProdutosAdmin());
  } catch (e) {
    next(e);
  }
});

router.post("/produtos", async (req, res, next) => {
  try {
    const body = produtoSchema.parse(req.body);
    const id = await adminService.criarProduto(body);
    return ok(res, { id }, 201);
  } catch (e) {
    next(e);
  }
});

router.put("/produtos/:id", async (req, res, next) => {
  try {
    const body = produtoSchema.partial().parse(req.body);
    const okUpdate = await adminService.atualizarProduto(
      Number(req.params.id),
      body
    );
    if (!okUpdate) return fail(res, "Produto não encontrado", 404);
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

router.delete("/produtos/:id", async (req, res, next) => {
  try {
    const okDel = await adminService.excluirProduto(Number(req.params.id));
    if (!okDel) return fail(res, "Produto não encontrado", 404);
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

// Missões
router.get("/missoes", async (_req, res, next) => {
  try {
    return ok(res, await adminService.listarMissoes());
  } catch (e) {
    next(e);
  }
});

router.post("/missoes", async (req, res, next) => {
  try {
    const body = missaoSchema.parse(req.body);
    const id = await adminService.criarMissao(body);
    return ok(res, { id }, 201);
  } catch (e) {
    next(e);
  }
});

router.put("/missoes/:id", async (req, res, next) => {
  try {
    const body = missaoSchema.partial().parse(req.body);
    const okUpdate = await adminService.atualizarMissao(
      Number(req.params.id),
      body
    );
    if (!okUpdate) return fail(res, "Missão não encontrada", 404);
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

router.delete("/missoes/:id", async (req, res, next) => {
  try {
    const okDel = await adminService.excluirMissao(Number(req.params.id));
    if (!okDel) return fail(res, "Missão não encontrada", 404);
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

// Eventos
router.get("/eventos", async (_req, res, next) => {
  try {
    return ok(res, await adminService.listarEventos());
  } catch (e) {
    next(e);
  }
});

router.post("/eventos", async (req, res, next) => {
  try {
    const body = eventoSchema.parse(req.body);
    const id = await adminService.criarEvento(body);
    return ok(res, { id }, 201);
  } catch (e) {
    next(e);
  }
});

router.put("/eventos/:id", async (req, res, next) => {
  try {
    const body = eventoSchema.partial().parse(req.body);
    const okUpdate = await adminService.atualizarEvento(
      Number(req.params.id),
      body
    );
    if (!okUpdate) return fail(res, "Evento não encontrado", 404);
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

router.delete("/eventos/:id", async (req, res, next) => {
  try {
    const okDel = await adminService.excluirEvento(Number(req.params.id));
    if (!okDel) return fail(res, "Evento não encontrado", 404);
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
