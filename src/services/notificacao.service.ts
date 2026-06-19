import { AppDataSource } from "../config/database";
import { Notificacao } from "../entities/Notificacao";

export async function listarNotificacoes(usuarioId: number, apenasNaoLidas = false) {
  const qb = AppDataSource.getRepository(Notificacao)
    .createQueryBuilder("n")
    .where("n.usuarioId = :usuarioId", { usuarioId })
    .orderBy("n.criadoEm", "DESC")
    .limit(50);

  if (apenasNaoLidas) qb.andWhere("n.lida = 0");

  return qb.getMany();
}

export async function contarNaoLidas(usuarioId: number) {
  return AppDataSource.getRepository(Notificacao).count({
    where: { usuarioId, lida: false },
  });
}

export async function marcarComoLida(usuarioId: number, notificacaoId: string) {
  const result = await AppDataSource.getRepository(Notificacao).update(
    { id: notificacaoId, usuarioId },
    { lida: true }
  );
  return (result.affected ?? 0) > 0;
}

export async function marcarTodasComoLidas(usuarioId: number) {
  const result = await AppDataSource.getRepository(Notificacao).update(
    { usuarioId, lida: false },
    { lida: true }
  );
  return result.affected ?? 0;
}
