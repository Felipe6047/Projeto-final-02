import { In } from "typeorm";
import { AppDataSource } from "../config/database";
import { Usuario } from "../entities/Usuario";
import { PropostaTroca } from "../entities/PropostaTroca";
import { Compra } from "../entities/Compra";
import { CupomUsuario } from "../entities/CupomUsuario";
import { PedidoPresente } from "../entities/PedidoPresente";
import { Campanha } from "../entities/Campanha";
import { NivelFidelidade } from "../entities/NivelFidelidade";
import { CupomTemplate } from "../entities/CupomTemplate";
import { Produto } from "../entities/Produto";
import { Missao } from "../entities/Missao";
import { EventoSazonal } from "../entities/EventoSazonal";
import { UsuarioMissao } from "../entities/UsuarioMissao";
import { UsuarioConquista } from "../entities/UsuarioConquista";

export async function getDashboard() {
  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const propostaRepo = AppDataSource.getRepository(PropostaTroca);
  const compraRepo = AppDataSource.getRepository(Compra);
  const cupomRepo = AppDataSource.getRepository(CupomUsuario);
  const pedidoRepo = AppDataSource.getRepository(PedidoPresente);
  const campanhaRepo = AppDataSource.getRepository(Campanha);
  const uMissaoRepo = AppDataSource.getRepository(UsuarioMissao);
  const uConquistaRepo = AppDataSource.getRepository(UsuarioConquista);

  const [
    clientesAtivos,
    trocasConcluidas,
    trocasPendentes,
    ticketMedio,
    cuponsAtivos,
    pedidosPendentes,
    campanhasAtivas,
    missoesConcluidas,
    trofeusDesbloqueados,
  ] = await Promise.all([
      usuarioRepo.count({ where: { ativo: true } }),
      propostaRepo.count({ where: { status: "aceita" } }),
      propostaRepo.count({ where: { status: "pendente" } }),
      compraRepo
        .createQueryBuilder("c")
        .select("COALESCE(AVG(c.valorTotal), 0)", "media")
        .getRawOne<{ media: string }>(),
      cupomRepo.count({
        where: { status: In(["disponivel", "oferecido_troca"]) },
      }),
      pedidoRepo.count({ where: { status: "pendente" } }),
      campanhaRepo
        .createQueryBuilder("c")
        .where("c.ativa = 1")
        .andWhere("NOW() BETWEEN c.inicioEm AND c.fimEm")
        .getCount(),
      uMissaoRepo.count({ where: { concluida: true } }),
      uConquistaRepo.count(),
    ]);

  // Retenção fictícia apenas para o visual, já que não temos tabela de LoginDiario ainda.
  const retencao3Dias = Math.floor(Math.random() * (85 - 40 + 1)) + 40; 

  return {
    clientesAtivos,
    trocasConcluidas,
    trocasPendentes,
    ticketMedio: Number(ticketMedio?.media ?? 0),
    cuponsAtivos,
    pedidosPendentes,
    campanhasAtivas,
    missoesConcluidas,
    trofeusDesbloqueados,
    retencao3Dias,
  };
}

export async function getSegmentacao() {
  return AppDataSource.getRepository(NivelFidelidade)
    .createQueryBuilder("n")
    .leftJoin(
      Usuario,
      "u",
      "u.nivelId = n.id AND u.ativo = 1 AND u.papel = 'cliente'"
    )
    .select([
      "n.nome AS nivel",
      "n.slug AS nivel_slug",
      "n.ordem AS ordem",
      "COUNT(u.id) AS total_clientes",
      "COALESCE(SUM(u.pontos), 0) AS pontos_totais",
      "COALESCE(AVG(u.pontos), 0) AS media_pontos",
    ])
    .groupBy("n.id")
    .addGroupBy("n.nome")
    .addGroupBy("n.slug")
    .addGroupBy("n.ordem")
    .orderBy("n.ordem", "ASC")
    .getRawMany();
}

// --- Campanhas ---
export async function listarCampanhas() {
  const rows = await AppDataSource.getRepository(Campanha).find({
    order: { criadoEm: "DESC" },
  });
  return rows.map((r) => ({
    id: r.id,
    titulo: r.titulo,
    descricao: r.descricao,
    segmento_json: r.segmentoJson,
    inicio_em: r.inicioEm,
    fim_em: r.fimEm,
    ativa: r.ativa,
    criado_em: r.criadoEm,
  }));
}

export async function criarCampanha(data: {
  titulo: string;
  descricao?: string;
  segmento_json?: object;
  inicio_em: string;
  fim_em: string;
  ativa?: boolean;
}) {
  const campanha = await AppDataSource.getRepository(Campanha).save({
    titulo: data.titulo,
    descricao: data.descricao ?? null,
    segmentoJson: data.segmento_json ?? null,
    inicioEm: new Date(data.inicio_em),
    fimEm: new Date(data.fim_em),
    ativa: data.ativa !== false,
  });
  return campanha.id;
}

export async function atualizarCampanha(
  id: number,
  data: Partial<{
    titulo: string;
    descricao: string;
    segmento_json: object;
    inicio_em: string;
    fim_em: string;
    ativa: boolean;
  }>
) {
  const patch: Partial<Campanha> = {};
  if (data.titulo !== undefined) patch.titulo = data.titulo;
  if (data.descricao !== undefined) patch.descricao = data.descricao;
  if (data.segmento_json !== undefined) patch.segmentoJson = data.segmento_json;
  if (data.inicio_em !== undefined) patch.inicioEm = new Date(data.inicio_em);
  if (data.fim_em !== undefined) patch.fimEm = new Date(data.fim_em);
  if (data.ativa !== undefined) patch.ativa = data.ativa;

  if (!Object.keys(patch).length) return false;

  const result = await AppDataSource.getRepository(Campanha).update({ id }, patch);
  return (result.affected ?? 0) > 0;
}

export async function excluirCampanha(id: number) {
  const result = await AppDataSource.getRepository(Campanha).delete({ id });
  return (result.affected ?? 0) > 0;
}

// --- Cupom templates ---
export async function listarCupomTemplates() {
  const cupons = await AppDataSource.getRepository(CupomTemplate).find({
    order: { titulo: "ASC" },
  });
  return cupons.map((c) => ({
    id: c.id,
    titulo: c.titulo,
    descricao: c.descricao,
    categoria: c.categoria,
    desconto_percentual: c.descontoPercentual ? Number(c.descontoPercentual) : undefined,
    desconto_valor: c.descontoValor ? Number(c.descontoValor) : undefined,
    valor_minimo_compra: c.valorMinimoCompra ? Number(c.valorMinimoCompra) : undefined,
    imagem_url: c.imagemUrl,
    dias_validade: c.diasValidade,
    preco_pontos: c.precoPontos,
    ativo: c.ativo,
    limite_por_usuario: c.limitePorUsuario,
    limite_total: c.limiteTotal,
    criado_em: c.criadoEm,
  }));
}

export async function criarCupomTemplate(data: {
  titulo: string;
  descricao?: string;
  categoria: string;
  desconto_percentual?: number;
  desconto_valor?: number;
  valor_minimo_compra?: number;
  dias_validade?: number;
  ativo?: boolean;
  limite_por_usuario?: number;
  limite_total?: number;
}) {
  const template = await AppDataSource.getRepository(CupomTemplate).save({
    titulo: data.titulo,
    descricao: data.descricao ?? null,
    categoria: data.categoria,
    descontoPercentual:
      data.desconto_percentual !== undefined
        ? String(data.desconto_percentual)
        : null,
    descontoValor:
      data.desconto_valor !== undefined ? String(data.desconto_valor) : null,
    valorMinimoCompra:
      data.valor_minimo_compra !== undefined
        ? String(data.valor_minimo_compra)
        : null,
    diasValidade: data.dias_validade ?? 30,
    ativo: data.ativo !== false,
    limitePorUsuario: data.limite_por_usuario ?? null,
    limiteTotal: data.limite_total ?? null,
  });
  return template.id;
}

export async function atualizarCupomTemplate(
  id: number,
  data: Record<string, unknown>
) {
  const patch = mapCupomTemplatePatch(data);
  if (!Object.keys(patch).length) return false;
  const result = await AppDataSource.getRepository(CupomTemplate).update({ id }, patch);
  return (result.affected ?? 0) > 0;
}

export async function excluirCupomTemplate(id: number) {
  const result = await AppDataSource.getRepository(CupomTemplate).delete({ id });
  return (result.affected ?? 0) > 0;
}

// --- Produtos ---
export async function listarProdutosAdmin() {
  const produtos = await AppDataSource.getRepository(Produto).find({ order: { nome: "ASC" } });
  return produtos.map((p) => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    categoria: p.categoria,
    preco_reais: Number(p.precoReais),
    preco_pontos: p.precoPontos,
    estoque: p.estoque,
    imagem_url: p.imagemUrl,
    ativo: p.ativo,
  }));
}

export async function criarProduto(data: {
  nome: string;
  descricao?: string;
  preco_reais: number;
  preco_pontos: number;
  estoque?: number;
  ativo?: boolean;
}) {
  const produto = await AppDataSource.getRepository(Produto).save({
    nome: data.nome,
    descricao: data.descricao ?? null,
    precoReais: String(data.preco_reais),
    precoPontos: data.preco_pontos,
    estoque: data.estoque ?? 0,
    ativo: data.ativo !== false,
  });
  return produto.id;
}

export async function atualizarProduto(id: number, data: Record<string, unknown>) {
  const patch = mapProdutoPatch(data);
  if (!Object.keys(patch).length) return false;
  const result = await AppDataSource.getRepository(Produto).update({ id }, patch);
  return (result.affected ?? 0) > 0;
}

export async function excluirProduto(id: number) {
  const result = await AppDataSource.getRepository(Produto).update({ id }, { ativo: false });
  return (result.affected ?? 0) > 0;
}

// --- Missões ---
export async function listarMissoes() {
  const missoes = await AppDataSource.getRepository(Missao).find({ order: { id: "DESC" } });
  return missoes.map((m) => ({
    id: m.id,
    titulo: m.titulo,
    descricao: m.descricao,
    pontos_recompensa: m.pontosRecompensa,
    meta_valor: m.metaValor,
    tipo_meta: m.tipoMeta,
    ativa: m.ativa,
    inicio_em: m.inicioEm,
    fim_em: m.fimEm,
  }));
}

export async function criarMissao(data: {
  titulo: string;
  descricao?: string;
  pontos_recompensa: number;
  meta_valor?: number;
  tipo_meta: "compras" | "trocas" | "presentes" | "pontos";
  ativa?: boolean;
  inicio_em?: string;
  fim_em?: string;
}) {
  const missao = await AppDataSource.getRepository(Missao).save({
    titulo: data.titulo,
    descricao: data.descricao ?? null,
    pontosRecompensa: data.pontos_recompensa,
    metaValor: data.meta_valor ?? 1,
    tipoMeta: data.tipo_meta,
    ativa: data.ativa !== false,
    inicioEm: data.inicio_em ?? null,
    fimEm: data.fim_em ?? null,
  });
  return missao.id;
}

export async function atualizarMissao(id: number, data: Record<string, unknown>) {
  const patch = mapMissaoPatch(data);
  if (!Object.keys(patch).length) return false;
  const result = await AppDataSource.getRepository(Missao).update({ id }, patch);
  return (result.affected ?? 0) > 0;
}

export async function excluirMissao(id: number) {
  const result = await AppDataSource.getRepository(Missao).delete({ id });
  return (result.affected ?? 0) > 0;
}

// --- Eventos sazonais ---
export async function listarEventos() {
  const eventos = await AppDataSource.getRepository(EventoSazonal).find({
    order: { inicioEm: "DESC" },
  });
  return eventos.map((e) => ({
    id: e.id,
    titulo: e.titulo,
    descricao: e.descricao,
    trocas_extras: e.trocasExtras,
    inicio_em: e.inicioEm,
    fim_em: e.fimEm,
    ativo: e.ativo,
  }));
}

export async function criarEvento(data: {
  titulo: string;
  descricao?: string;
  trocas_extras?: number;
  inicio_em: string;
  fim_em: string;
  ativo?: boolean;
}) {
  const evento = await AppDataSource.getRepository(EventoSazonal).save({
    titulo: data.titulo,
    descricao: data.descricao ?? null,
    trocasExtras: data.trocas_extras ?? 0,
    inicioEm: new Date(data.inicio_em),
    fimEm: new Date(data.fim_em),
    ativo: data.ativo !== false,
  });
  return evento.id;
}

export async function atualizarEvento(id: number, data: Record<string, unknown>) {
  const patch = mapEventoPatch(data);
  if (!Object.keys(patch).length) return false;
  const result = await AppDataSource.getRepository(EventoSazonal).update({ id }, patch);
  return (result.affected ?? 0) > 0;
}

export async function excluirEvento(id: number) {
  const result = await AppDataSource.getRepository(EventoSazonal).delete({ id });
  return (result.affected ?? 0) > 0;
}

function mapCupomTemplatePatch(data: Record<string, unknown>): Partial<CupomTemplate> {
  const patch: Partial<CupomTemplate> = {};
  if (data.titulo !== undefined) patch.titulo = String(data.titulo);
  if (data.descricao !== undefined) patch.descricao = data.descricao as string | null;
  if (data.categoria !== undefined) patch.categoria = String(data.categoria);
  if (data.desconto_percentual !== undefined) {
    patch.descontoPercentual = String(data.desconto_percentual);
  }
  if (data.desconto_valor !== undefined) patch.descontoValor = String(data.desconto_valor);
  if (data.valor_minimo_compra !== undefined) {
    patch.valorMinimoCompra = String(data.valor_minimo_compra);
  }
  if (data.dias_validade !== undefined) patch.diasValidade = Number(data.dias_validade);
  if (data.ativo !== undefined) patch.ativo = Boolean(data.ativo);
  if (data.limite_por_usuario !== undefined) patch.limitePorUsuario = data.limite_por_usuario as number | null;
  if (data.limite_total !== undefined) patch.limiteTotal = data.limite_total as number | null;
  return patch;
}

function mapProdutoPatch(data: Record<string, unknown>): Partial<Produto> {
  const patch: Partial<Produto> = {};
  if (data.nome !== undefined) patch.nome = String(data.nome);
  if (data.descricao !== undefined) patch.descricao = data.descricao as string | null;
  if (data.preco_reais !== undefined) patch.precoReais = String(data.preco_reais);
  if (data.preco_pontos !== undefined) patch.precoPontos = Number(data.preco_pontos);
  if (data.estoque !== undefined) patch.estoque = Number(data.estoque);
  if (data.ativo !== undefined) patch.ativo = Boolean(data.ativo);
  return patch;
}

function mapMissaoPatch(data: Record<string, unknown>): Partial<Missao> {
  const patch: Partial<Missao> = {};
  if (data.titulo !== undefined) patch.titulo = String(data.titulo);
  if (data.descricao !== undefined) patch.descricao = data.descricao as string | null;
  if (data.pontos_recompensa !== undefined) {
    patch.pontosRecompensa = Number(data.pontos_recompensa);
  }
  if (data.meta_valor !== undefined) patch.metaValor = Number(data.meta_valor);
  if (data.tipo_meta !== undefined) {
    patch.tipoMeta = data.tipo_meta as Missao["tipoMeta"];
  }
  if (data.ativa !== undefined) patch.ativa = Boolean(data.ativa);
  if (data.inicio_em !== undefined) patch.inicioEm = data.inicio_em as string | null;
  if (data.fim_em !== undefined) patch.fimEm = data.fim_em as string | null;
  return patch;
}

function mapEventoPatch(data: Record<string, unknown>): Partial<EventoSazonal> {
  const patch: Partial<EventoSazonal> = {};
  if (data.titulo !== undefined) patch.titulo = String(data.titulo);
  if (data.descricao !== undefined) patch.descricao = data.descricao as string | null;
  if (data.trocas_extras !== undefined) patch.trocasExtras = Number(data.trocas_extras);
  if (data.inicio_em !== undefined) patch.inicioEm = new Date(String(data.inicio_em));
  if (data.fim_em !== undefined) patch.fimEm = new Date(String(data.fim_em));
  if (data.ativo !== undefined) patch.ativo = Boolean(data.ativo);
  return patch;
}
