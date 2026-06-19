import { Router } from "express";
import { AppDataSource } from "../config/database";
import authRoutes from "./auth.routes";
import mercadoRoutes from "./mercado.routes";
import presentesRoutes from "./presentes.routes";
import rankingRoutes from "./ranking.routes";
import produtosRoutes from "./produtos.routes";
import adminRoutes from "./admin.routes";
import compraRoutes from "./compra.routes";
import notificacaoRoutes from "./notificacao.routes";
import salasRoutes from "./salas.routes";
import simuladorCaixaRoutes from "./simulador-caixa.routes";
import missoesRoutes from "./missoes.routes";
import campanhasRoutes from "./campanhas.routes";
import amigosRoutes from "./amigos.routes";
import enderecoRoutes from "./endereco.routes";
import cartaoRoutes from "./cartao.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", projeto: "FRIK API" });
});
 
 router.get("/health/db", async (_req, res) => {
   try {
     if (!AppDataSource.isInitialized) {
       return res.status(200).json({ status: "ok", db: "not-initialized" });
     }
     const result = await AppDataSource.query("SELECT VERSION() AS version");
     return res.status(200).json({ status: "ok", db: result[0] });
   } catch (err) {
     console.error("DB health check failed:", err);
     return res.status(500).json({ status: "ok", db: "error", error: String(err) });
   }
 });

router.use("/auth", authRoutes);
router.use("/cartoes", cartaoRoutes);
router.use("/mercado-cupons", mercadoRoutes);
router.use("/presentes", presentesRoutes);
router.use("/ranking", rankingRoutes);
router.use("/produtos", produtosRoutes);
router.use("/admin", adminRoutes);
router.use("/compra", compraRoutes);
router.use("/notificacoes", notificacaoRoutes);
router.use("/salas", salasRoutes);
router.use("/simulador-caixa", simuladorCaixaRoutes);
router.use("/missoes", missoesRoutes);
router.use("/campanhas", campanhasRoutes);
router.use("/amigos", amigosRoutes);
router.use("/enderecos", enderecoRoutes);

export default router;
