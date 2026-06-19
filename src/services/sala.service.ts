import crypto from "crypto";
import { AppDataSource } from "../config/database";
import { Usuario } from "../entities/Usuario";
import { SalaTroca } from "../entities/SalaTroca";
import { SalaTrocaMembro } from "../entities/SalaTrocaMembro";
import { CupomUsuario } from "../entities/CupomUsuario";
import { PropostaTroca } from "../entities/PropostaTroca";
import { criarNotificacao } from "./gamificacao.service";

function gerarCodigoConvite() {
  return crypto.randomBytes(4).toString("hex").slice(0, 8).toUpperCase();
}

export async function criarSala(criadorId: number, nome: string) {
  const nivel = await AppDataSource.getRepository(Usuario)
    .createQueryBuilder("u")
    .innerJoin("u.nivel", "n")
    .select("n.podeCriarSalaTroca", "pode_criar")
    .where("u.id = :id", { id: criadorId })
    .getRawOne<{ pode_criar: boolean }>();

  if (!nivel?.pode_criar) {
    return { erro: "Seu nível não permite criar salas de troca" };
  }

  let codigo = gerarCodigoConvite();
  let tentativas = 0;
  const repo = AppDataSource.getRepository(SalaTroca);

  while (await repo.findOne({ where: { codigoConvite: codigo } })) {
    codigo = gerarCodigoConvite();
    tentativas += 1;
    if (tentativas > 5) return { erro: "Não foi possível gerar código da sala" };
  }

  const sala = await repo.save({
    criadorId,
    nome,
    codigoConvite: codigo,
  });

  await AppDataSource.getRepository(SalaTrocaMembro).save({
    salaId: sala.id,
    usuarioId: criadorId,
  });

  return {
    salaId: sala.id,
    nome: sala.nome,
    codigoConvite: sala.codigoConvite,
  };
}

export async function entrarSala(usuarioId: number, codigoConvite: string) {
  const sala = await AppDataSource.getRepository(SalaTroca).findOne({
    where: { codigoConvite: codigoConvite.toUpperCase() },
  });
  if (!sala) return { erro: "Sala não encontrada" };

  const membroRepo = AppDataSource.getRepository(SalaTrocaMembro);
  const jaMembro = await membroRepo.findOne({
    where: { salaId: sala.id, usuarioId },
  });
  if (!jaMembro) {
    await membroRepo.save({ salaId: sala.id, usuarioId });
    await criarNotificacao(
      sala.criadorId,
      "Novo membro na sala",
      "Alguém entrou na sua sala de troca.",
      "sala_troca"
    );
  }

  return { salaId: sala.id, nome: sala.nome, codigoConvite: sala.codigoConvite };
}

export async function listarMinhasSalas(usuarioId: number) {
  return AppDataSource.getRepository(SalaTroca)
    .createQueryBuilder("s")
    .innerJoin(SalaTrocaMembro, "m", "m.salaId = s.id")
    .select([
      "s.id AS id",
      "s.nome AS nome",
      "s.codigoConvite AS codigo_convite",
      "s.criadoEm AS criado_em",
    ])
    .where("m.usuarioId = :usuarioId", { usuarioId })
    .orderBy("s.criadoEm", "DESC")
    .getRawMany();
}

export async function detalheSala(codigoConvite: string) {
  const sala = await AppDataSource.getRepository(SalaTroca)
    .createQueryBuilder("s")
    .innerJoin("s.criador", "c")
    .select([
      "s.id AS id",
      "s.nome AS nome",
      "s.codigoConvite AS codigo_convite",
      "s.criadorId AS criador_id",
      "c.nome AS criador_nome",
    ])
    .where("s.codigoConvite = :codigo", {
      codigo: codigoConvite.toUpperCase(),
    })
    .getRawOne();

  if (!sala) return null;

  const membros = await AppDataSource.getRepository(SalaTrocaMembro)
    .createQueryBuilder("m")
    .innerJoin(Usuario, "u", "u.id = m.usuarioId")
    .innerJoin("u.nivel", "n")
    .select([
      "u.id AS id",
      "u.nome AS nome",
      "n.nome AS nivel",
      "n.slug AS nivel_slug",
    ])
    .where("m.salaId = :salaId", { salaId: sala.id })
    .getRawMany();

  return { ...sala, membros, totalMembros: membros.length };
}

export async function listarCuponsMembrosSala(
  codigoConvite: string,
  usuarioId: number
) {
  const sala = await AppDataSource.getRepository(SalaTroca).findOne({
    where: { codigoConvite: codigoConvite.toUpperCase() },
  });
  if (!sala) return null;

  const souMembro = await AppDataSource.getRepository(SalaTrocaMembro).findOne({
    where: { salaId: sala.id, usuarioId },
  });
  if (!souMembro) return { erro: "Você não participa desta sala" };

  return AppDataSource.getRepository(CupomUsuario)
    .createQueryBuilder("cu")
    .innerJoin("cu.template", "ct")
    .innerJoin("cu.usuario", "u")
    .innerJoin(SalaTrocaMembro, "m", "m.usuarioId = cu.usuarioId AND m.salaId = :salaId", {
      salaId: sala.id,
    })
    .select([
      "cu.id AS id",
      "cu.codigo AS codigo",
      "cu.status AS status",
      "cu.usuarioId AS usuario_id",
      "ct.titulo AS titulo",
      "u.nome AS proprietario_nome",
    ])
    .where("cu.status = 'disponivel'")
    .andWhere("cu.usuarioId != :usuarioId", { usuarioId })
    .getRawMany();
}

export async function listarPropostasSala(codigoConvite: string, usuarioId: number) {
  const sala = await AppDataSource.getRepository(SalaTroca).findOne({
    where: { codigoConvite: codigoConvite.toUpperCase() },
  });
  if (!sala) return null;

  const membroIds = (
    await AppDataSource.getRepository(SalaTrocaMembro).find({
      where: { salaId: sala.id },
      select: ["usuarioId"],
    })
  ).map((m) => m.usuarioId);

  if (!membroIds.includes(usuarioId)) return { erro: "Você não participa desta sala" };

  if (membroIds.length === 0) return [];

  return AppDataSource.getRepository(PropostaTroca)
    .createQueryBuilder("pt")
    .innerJoin("pt.solicitante", "s")
    .innerJoin("pt.proprietario", "p")
    .select([
      "pt.id AS id",
      "pt.status AS status",
      "pt.solicitanteId AS solicitante_id",
      "pt.proprietarioId AS proprietario_id",
      "s.nome AS solicitante_nome",
      "p.nome AS proprietario_nome",
      "pt.criadoEm AS criado_em",
    ])
    .where("pt.salaId = :salaId", { salaId: sala.id })
    .andWhere("pt.status IN (:...statuses)", { statuses: ["pendente", "aceita", "recusada"] })
    .orderBy("pt.criadoEm", "DESC")
    .getRawMany();
}

export async function sairSala(usuarioId: number, codigoConvite: string) {
  const sala = await AppDataSource.getRepository(SalaTroca).findOne({
    where: { codigoConvite: codigoConvite.toUpperCase() },
  });
  if (!sala) return { erro: "Sala não encontrada" };

  if (sala.criadorId === usuarioId) {
    return { erro: "Você é o dono da sala. Para removê-la, use a opção 'Excluir sala'." };
  }

  const membroRepo = AppDataSource.getRepository(SalaTrocaMembro);
  const membro = await membroRepo.findOne({
    where: { salaId: sala.id, usuarioId },
  });
  if (!membro) return { erro: "Você não é membro desta sala" };

  await membroRepo.remove(membro);
  return {};
}

export async function excluirSala(usuarioId: number, codigoConvite: string) {
  const salaRepo = AppDataSource.getRepository(SalaTroca);
  const sala = await salaRepo.findOne({
    where: { codigoConvite: codigoConvite.toUpperCase() },
  });
  if (!sala) return { erro: "Sala não encontrada" };
  if (sala.criadorId !== usuarioId) {
    return { erro: "Apenas o criador pode excluir a sala" };
  }

  // Remove todos os membros antes de excluir a sala
  await AppDataSource.getRepository(SalaTrocaMembro).delete({ salaId: sala.id });
  await salaRepo.remove(sala);
  return {};
}

