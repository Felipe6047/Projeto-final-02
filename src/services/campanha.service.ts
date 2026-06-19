import { AppDataSource } from "../config/database";
import { Campanha } from "../entities/Campanha";
import { Usuario } from "../entities/Usuario";

export async function listarCampanhasAtivas(usuarioId: number) {
  const usuario = await AppDataSource.getRepository(Usuario)
    .createQueryBuilder("u")
    .innerJoin("u.nivel", "n")
    .select(["n.slug AS slug"])
    .where("u.id = :id", { id: usuarioId })
    .getRawOne<{ slug: string }>();

  const nivelSlug = usuario?.slug ?? "bronze";

  const campanhas = await AppDataSource.getRepository(Campanha)
    .createQueryBuilder("c")
    .where("c.ativa = 1")
    .andWhere("NOW() BETWEEN c.inicioEm AND c.fimEm")
    .orderBy("c.fimEm", "ASC")
    .getMany();

  return campanhas.filter((c) => {
    const seg = c.segmentoJson as { nivel_slug?: string[] } | null;
    if (!seg?.nivel_slug?.length) return true;
    return seg.nivel_slug.includes(nivelSlug);
  });
}
