import { Router } from "express";
import { z } from "zod";
import * as enderecoService from "../services/endereco.service";
import { authRequired } from "../middleware/auth";
import { fail, ok } from "../utils/http";

const router = Router();
router.use(authRequired);

const enderecoSchema = z.object({
  apelido: z.string().optional(),
  cep: z.string().min(8),
  logradouro: z.string().min(2),
  numero: z.string().min(1),
  complemento: z.string().optional(),
  bairro: z.string().min(2),
  cidade: z.string().min(2),
  uf: z.string().length(2),
  principal: z.boolean().optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const enderecos = await enderecoService.listarEnderecos(req.user!.id);
    return ok(res, enderecos);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = enderecoSchema.parse(req.body);
    const result = await enderecoService.criarEndereco(req.user!.id, body);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const body = enderecoSchema.partial().parse(req.body);
    const result = await enderecoService.atualizarEndereco(
      Number(req.params.id),
      req.user!.id,
      body
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await enderecoService.excluirEndereco(
      Number(req.params.id),
      req.user!.id
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

export default router;
