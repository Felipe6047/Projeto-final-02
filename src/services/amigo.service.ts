import { AppDataSource } from "../config/database";
import { Amizade } from "../entities/Amizade";
import { Usuario } from "../entities/Usuario";
import { Endereco } from "../entities/Endereco";

export async function listarAmigos(usuarioId: number) {
  const rows = await AppDataSource.getRepository(Amizade)
    .createQueryBuilder("a")
    .innerJoin(Usuario, "u", "u.id = a.amigoId")
    .innerJoin("u.nivel", "n")
    .leftJoin(Endereco, "e", "e.usuarioId = u.id AND e.principal = 1")
    .select([
      "u.id AS id",
      "u.nome AS nome",
      "u.email AS email",
      "n.nome AS nivel",
      "CASE WHEN e.id IS NOT NULL THEN 1 ELSE 0 END AS tem_endereco",
    ])
    .where("a.usuarioId = :usuarioId", { usuarioId })
    .orderBy("u.nome", "ASC")
    .getRawMany();

  return rows;
}

export async function adicionarAmigo(usuarioId: number, amigoId: number) {
  if (usuarioId === amigoId) return { erro: "Você não pode adicionar a si mesmo" };

  const amigo = await AppDataSource.getRepository(Usuario).findOne({
    where: { id: amigoId, ativo: true },
    select: ["id"],
  });
  if (!amigo) return { erro: "Usuário não encontrado" };

  const repo = AppDataSource.getRepository(Amizade);
  const existe = await repo.findOne({ where: { usuarioId, amigoId } });
  if (existe) return { erro: "Amigo já adicionado" };

  await repo.save({ usuarioId, amigoId });
  return { ok: true };
}

export async function removerAmigo(usuarioId: number, amigoId: number) {
  const result = await AppDataSource.getRepository(Amizade).delete({
    usuarioId,
    amigoId,
  });
  if (!result.affected) return { erro: "Amizade não encontrada" };
  return { ok: true };
}

export async function buscarUsuariosSistema(q: string, limite = 10) {
  const termo = q.trim();
  if (termo.length < 2) return [];

  return AppDataSource.getRepository(Usuario)
    .createQueryBuilder("u")
    .innerJoin("u.nivel", "n")
    .select([
      "u.id AS id",
      "u.nome AS nome",
      "u.email AS email",
      "n.nome AS nivel",
    ])
    .where("u.ativo = 1")
    .andWhere(
      "(u.nome LIKE :t OR u.email LIKE :t OR u.cpf LIKE :t)",
      { t: `%${termo}%` }
    )
    .limit(Math.min(limite, 20))
    .getRawMany();
}

export async function getEnderecoAmigo(amigoId: number) {
  return AppDataSource.getRepository(Endereco).findOne({
    where: { usuarioId: amigoId, principal: true },
  });
}
