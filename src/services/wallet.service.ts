import { EntityManager } from "typeorm";
import { AppDataSource } from "../config/database";
import { Usuario } from "../entities/Usuario";
import { ExtratoWallet } from "../entities/ExtratoWallet";
const CASHBACK_POR_NIVEL: Record<string, number> = {
  bronze: 0.01,
  prata: 0.02,
  ouro: 0.04,
  platina: 0.06,
  diamante: 0.1,
};

export async function creditarCashbackCompra(
  usuarioId: number,
  valorCompra: number,
  manager?: EntityManager
) {
  const em = manager ?? AppDataSource.manager;
  const row = await em
    .getRepository(Usuario)
    .createQueryBuilder("u")
    .innerJoin("u.nivel", "n")
    .select(["u.saldoWallet AS saldo", "n.slug AS slug"])
    .where("u.id = :id", { id: usuarioId })
    .getRawOne<{ saldo: string; slug: string }>();

  if (!row) return;

  const pct = CASHBACK_POR_NIVEL[row.slug] ?? 0.01;
  const cashback = Math.round(valorCompra * pct * 100) / 100;
  if (cashback <= 0) return;

  const saldoAtual = Number(row.saldo);
  const novoSaldo = saldoAtual + cashback;
  await em.getRepository(Usuario).update(
    { id: usuarioId },
    { saldoWallet: novoSaldo.toFixed(2) }
  );

  await em.getRepository(ExtratoWallet).save({
    usuarioId,
    valor: String(cashback.toFixed(2)),
    saldoApos: novoSaldo.toFixed(2),
    tipo: "cashback",
    descricao: `Cashback ${(pct * 100).toFixed(0)}% sobre compra de R$ ${valorCompra.toFixed(2)}`,
  });
}

export async function debitarWallet(
  usuarioId: number,
  valor: number,
  descricao: string,
  manager?: EntityManager
) {
  const em = manager ?? AppDataSource.manager;
  const usuario = await em.getRepository(Usuario).findOne({
    where: { id: usuarioId },
    select: ["id", "saldoWallet"],
  });
  if (!usuario) return { erro: "Usuário não encontrado" };

  const saldo = Number(usuario.saldoWallet);
  if (saldo < valor) return { erro: "Saldo da carteira insuficiente" };

  const novoSaldo = saldo - valor;
  await em.getRepository(Usuario).update(
    { id: usuarioId },
    { saldoWallet: novoSaldo.toFixed(2) }
  );

  await em.getRepository(ExtratoWallet).save({
    usuarioId,
    valor: String((-valor).toFixed(2)),
    saldoApos: novoSaldo.toFixed(2),
    tipo: "pagamento",
    descricao,
  });

  return { ok: true };
}

export async function listarExtratoWallet(usuarioId: number, limite = 20) {
  return AppDataSource.getRepository(ExtratoWallet)
    .createQueryBuilder("e")
    .select([
      "e.id AS id",
      "e.valor AS valor",
      "e.saldoApos AS saldo_apos",
      "e.tipo AS tipo",
      "e.descricao AS descricao",
      "e.criadoEm AS criado_em",
    ])
    .where("e.usuarioId = :usuarioId", { usuarioId })
    .orderBy("e.criadoEm", "DESC")
    .limit(limite)
    .getRawMany();
}
