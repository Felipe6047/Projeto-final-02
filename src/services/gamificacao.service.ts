import { EntityManager } from "typeorm";
import { AppDataSource } from "../config/database";
import { Usuario } from "../entities/Usuario";
import { NivelFidelidade } from "../entities/NivelFidelidade";
import { Notificacao } from "../entities/Notificacao";
import { Conquista } from "../entities/Conquista";
import { UsuarioConquista } from "../entities/UsuarioConquista";
import { UsuarioMissao } from "../entities/UsuarioMissao";
import { Missao } from "../entities/Missao";
import { HistoricoPontos } from "../entities/HistoricoPontos";
import { PresenteCupom } from "../entities/PresenteCupom";
import { PropostaTroca } from "../entities/PropostaTroca";

export async function criarNotificacao(
  usuarioId: number,
  titulo: string,
  mensagem: string,
  tipo: string,
  manager?: EntityManager
) {
  const repo = (manager ?? AppDataSource.manager).getRepository(Notificacao);
  return repo.save({ usuarioId, titulo, mensagem, tipo, lida: false });
}

export async function atualizarNivelPorPontos(
  usuarioId: number,
  manager?: EntityManager
) {
  const em = manager ?? AppDataSource.manager;
  const usuario = await em.getRepository(Usuario).findOne({
    where: { id: usuarioId },
    select: ["id", "pontos", "nivelId"],
  });
  if (!usuario) return;

  const nivel = await em
    .getRepository(NivelFidelidade)
    .createQueryBuilder("n")
    .where("n.pontosMinimos <= :pontos", { pontos: usuario.pontos })
    .orderBy("n.ordem", "DESC")
    .getOne();

  const nivelAtual = await em.getRepository(NivelFidelidade).findOne({
    where: { id: usuario.nivelId },
  });

  if (nivel && nivel.id !== usuario.nivelId) {
    const subiu = nivel.ordem > (nivelAtual?.ordem ?? 0);
    usuario.nivelId = nivel.id;
    await em.getRepository(Usuario).save(usuario);
    if (subiu) {
      await criarNotificacao(
        usuarioId,
        "Nível atualizado!",
        `Parabéns! Você alcançou o nível ${nivel.nome}.`,
        "nivel",
        manager
      );
    }
  }
}

export async function incrementarMissao(
  usuarioId: number,
  tipoMeta: Missao["tipoMeta"],
  valor = 1,
  manager?: EntityManager
) {
  const em = manager ?? AppDataSource.manager;
  const missoes = await em.getRepository(Missao).find({
    where: { tipoMeta, ativa: true },
  });

  for (const missao of missoes) {
    let um = await em.getRepository(UsuarioMissao).findOne({
      where: { usuarioId, missaoId: missao.id },
    });
    if (!um) {
      um = em.getRepository(UsuarioMissao).create({
        usuarioId,
        missaoId: missao.id,
        progresso: 0,
        concluida: false,
      });
    }
    if (um.concluida) continue;

    um.progresso = Math.min(um.progresso + valor, missao.metaValor);
    if (um.progresso >= missao.metaValor) {
      um.concluida = true;
      um.concluidaEm = new Date();
      await em.getRepository(Usuario).increment(
        { id: usuarioId },
        "pontos",
        missao.pontosRecompensa
      );
      const u = await em.getRepository(Usuario).findOneOrFail({
        where: { id: usuarioId },
        select: ["pontos"],
      });
      await em.getRepository(HistoricoPontos).save({
        usuarioId,
        valor: missao.pontosRecompensa,
        saldoApos: u.pontos,
        tipo: "missao",
        referenciaTipo: "missao",
        referenciaId: String(missao.id),
        descricao: `Missão concluída: ${missao.titulo}`,
      });
      await em.getRepository(Notificacao).save({
        usuarioId,
        titulo: "Missão concluída!",
        mensagem: `Você completou "${missao.titulo}" e ganhou ${missao.pontosRecompensa} pontos.`,
        tipo: "missao",
        lida: false,
      });
    }
    await em.getRepository(UsuarioMissao).save(um);
  }
}

export async function verificarConquistas(usuarioId: number, manager?: EntityManager) {
  const em = manager ?? AppDataSource.manager;
  const conquistaRepo = em.getRepository(Conquista);
  const ucRepo = em.getRepository(UsuarioConquista);

  const jaTem = async (slug: string) => {
    const c = await conquistaRepo.findOne({ where: { slug } });
    if (!c) return true;
    const uc = await ucRepo.findOne({
      where: { usuarioId, conquistaId: c.id },
    });
    return !!uc;
  };

  const desbloquear = async (slug: string) => {
    if (await jaTem(slug)) return;
    const c = await conquistaRepo.findOne({ where: { slug } });
    if (!c) return;
    await ucRepo.save({ usuarioId, conquistaId: c.id });
    await criarNotificacao(
      usuarioId,
      "Nova conquista!",
      `Você desbloqueou: ${c.nome}`,
      "conquista",
      manager
    );
  };

  // A conquista de boas-vindas deve ser desbloqueada imediatamente se for a primeira vez
  await desbloquear("bem_vindo");

  const presentesEnviados = await em.getRepository(PresenteCupom).count({
    where: { remetenteId: usuarioId },
  });
  if (presentesEnviados >= 5) await desbloquear("amigo_ouro");

  const trocasAceitas = await em.getRepository(PropostaTroca).count({
    where: [
      { solicitanteId: usuarioId, status: "aceita" },
      { proprietarioId: usuarioId, status: "aceita" },
    ],
  });
  if (trocasAceitas >= 10) await desbloquear("troca_justa");

  const presentesResgatados = await em.getRepository(PresenteCupom).count({
    where: { remetenteId: usuarioId, status: "resgatado" },
  });
  if (presentesResgatados >= 1) await desbloquear("corrente_bem");
}
