import { AppDataSource } from "../config/database";
import { Missao } from "../entities/Missao";
import { UsuarioMissao } from "../entities/UsuarioMissao";

export async function listarMissoesUsuario(usuarioId: number) {
  return AppDataSource.getRepository(Missao)
    .createQueryBuilder("m")
    .leftJoin(
      UsuarioMissao,
      "um",
      "um.missaoId = m.id AND um.usuarioId = :usuarioId",
      { usuarioId }
    )
    .select([
      "m.id AS id",
      "m.titulo AS titulo",
      "m.descricao AS descricao",
      "m.pontosRecompensa AS pontos_recompensa",
      "m.tipoMeta AS tipo_meta",
      "m.metaValor AS meta_valor",
      "COALESCE(um.progresso, 0) AS progresso",
      "COALESCE(um.concluida, 0) AS concluida",
    ])
    .where("m.ativa = 1")
    .orderBy("m.id", "ASC")
    .getRawMany();
}
