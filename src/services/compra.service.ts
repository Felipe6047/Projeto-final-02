import { AppDataSource } from "../config/database";
import { env } from "../config/env";
import { Compra } from "../entities/Compra";
import { Usuario } from "../entities/Usuario";
import { HistoricoPontos } from "../entities/HistoricoPontos";
import {
  atualizarNivelPorPontos,
  criarNotificacao,
  incrementarMissao,
  verificarConquistas,
} from "./gamificacao.service";
import { creditarCashbackCompra } from "./wallet.service";

export async function registrarCompra(usuarioId: number, valorTotal: number) {
  if (valorTotal <= 0) return { erro: "Valor da compra deve ser positivo" };

  const pontosGerados = Math.floor(valorTotal * env.pontosPorReal);

  return AppDataSource.transaction(async (manager) => {
    const compra = await manager.getRepository(Compra).save({
      usuarioId,
      valorTotal: String(valorTotal.toFixed(2)),
      pontosGerados,
    });

    await manager
      .getRepository(Usuario)
      .increment({ id: usuarioId }, "pontos", pontosGerados);

    const usuario = await manager.getRepository(Usuario).findOneOrFail({
      where: { id: usuarioId },
      select: ["pontos"],
    });

    await manager.getRepository(HistoricoPontos).save({
      usuarioId,
      valor: pontosGerados,
      saldoApos: usuario.pontos,
      tipo: "compra",
      referenciaTipo: "compra",
      referenciaId: compra.id,
      descricao: `Compra de R$ ${valorTotal.toFixed(2)}`,
    });

    await criarNotificacao(
      usuarioId,
      "Pontos creditados",
      `Você ganhou ${pontosGerados} pontos pela sua compra.`,
      "compra",
      manager
    );

    await creditarCashbackCompra(usuarioId, valorTotal, manager);
    await atualizarNivelPorPontos(usuarioId, manager);
    await incrementarMissao(usuarioId, "compras", 1, manager);
    await incrementarMissao(usuarioId, "pontos", pontosGerados, manager);
    await verificarConquistas(usuarioId, manager);

    return {
      compraId: compra.id,
      valorTotal,
      pontosGerados,
      saldoPontos: usuario.pontos,
    };
  });
}

export async function listarCompras(usuarioId: number, limite = 20) {
  return AppDataSource.getRepository(Compra)
    .createQueryBuilder("c")
    .select([
      "c.id AS id",
      "c.valorTotal AS valor_total",
      "c.pontosGerados AS pontos_gerados",
      "c.criadoEm AS criado_em",
    ])
    .where("c.usuarioId = :usuarioId", { usuarioId })
    .orderBy("c.criadoEm", "DESC")
    .limit(limite)
    .getRawMany();
}
