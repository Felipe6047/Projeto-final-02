import { Router } from "express";
import { AppDataSource } from "../config/database";
import { Produto } from "../entities/Produto";
import { ok } from "../utils/http";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const categoria = req.query.categoria as string;

    const where: any = { ativo: true };
    if (categoria && categoria !== 'Todos') {
      where.categoria = categoria;
    }

    const [rows, total] = await AppDataSource.getRepository(Produto).findAndCount({
      where,
      order: { nome: "ASC" },
      skip,
      take: limit,
      select: {
        id: true,
        nome: true,
        descricao: true,
        precoReais: true,
        precoPontos: true,
        estoque: true,
        imagemUrl: true,
        categoria: true,
      },
    });
    const mapped = rows.map((p) => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      preco_reais: p.precoReais,
      preco_pontos: p.precoPontos,
      estoque: p.estoque,
      imagem_url: p.imagemUrl,
      categoria: p.categoria,
    }));
    return ok(res, {
      data: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const produto = await AppDataSource.getRepository(Produto).findOne({
      where: { id: Number(req.params.id), ativo: true },
      select: {
        id: true,
        nome: true,
        descricao: true,
        precoReais: true,
        precoPontos: true,
        estoque: true,
        imagemUrl: true,
        categoria: true,
      },
    });
    if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });
    return ok(res, {
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco_reais: produto.precoReais,
      preco_pontos: produto.precoPontos,
      estoque: produto.estoque,
      imagem_url: produto.imagemUrl,
      categoria: produto.categoria,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
