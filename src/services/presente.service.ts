import crypto from "crypto";
import { AppDataSource } from "../config/database";
import { Usuario } from "../entities/Usuario";
import { CupomUsuario } from "../entities/CupomUsuario";
import { PresenteCupom } from "../entities/PresenteCupom";
import { PedidoPresente } from "../entities/PedidoPresente";
import { PedidoPresenteItem } from "../entities/PedidoPresenteItem";
import { Produto } from "../entities/Produto";
import { CupomTemplate } from "../entities/CupomTemplate";
import {
  criarNotificacao,
  incrementarMissao,
  verificarConquistas,
} from "./gamificacao.service";
import { debitarWallet } from "./wallet.service";

export async function presentearCupom(data: {
  remetenteId: number;
  cupomId: number;
  canal: "email" | "whatsapp" | "sms" | "link";
  mensagem?: string;
  destinatarioEmail?: string;
  destinatarioTelefone?: string;
  destinatarioCpf?: string;
  destinatarioNome?: string;
}) {
  const nivel = await AppDataSource.getRepository(Usuario)
    .createQueryBuilder("u")
    .innerJoin("u.nivel", "n")
    .select("n.podePresentearCupom", "pode_presentear_cupom")
    .where("u.id = :id", { id: data.remetenteId })
    .getRawOne<{ pode_presentear_cupom: boolean }>();

  if (!nivel?.pode_presentear_cupom) {
    return { erro: "Seu nível não permite presentear cupons" };
  }

  const cupom = await AppDataSource.getRepository(CupomUsuario).findOne({
    where: {
      id: String(data.cupomId),
      usuarioId: data.remetenteId,
      status: "disponivel",
    },
  });
  if (!cupom) return { erro: "Cupom indisponível para presente" };

  let destinatarioId: number | null = null;
  if (data.destinatarioCpf || data.destinatarioEmail) {
    const dest = await AppDataSource.getRepository(Usuario)
      .createQueryBuilder("u")
      .where(
        "(:cpf IS NOT NULL AND u.cpf = :cpf) OR (:email IS NOT NULL AND u.email = :email)",
        {
          cpf: data.destinatarioCpf ?? null,
          email: data.destinatarioEmail ?? null,
        }
      )
      .limit(1)
      .getOne();
    destinatarioId = dest?.id ?? null;
  }

  const codigo = crypto.randomBytes(16).toString("hex");
  const presente = await AppDataSource.getRepository(PresenteCupom).save({
    cupomId: String(data.cupomId),
    remetenteId: data.remetenteId,
    destinatarioId,
    destinatarioNome: data.destinatarioNome ?? null,
    destinatarioEmail: data.destinatarioEmail ?? null,
    destinatarioTelefone: data.destinatarioTelefone ?? null,
    destinatarioCpf: data.destinatarioCpf ?? null,
    canal: data.canal,
    mensagem: data.mensagem ?? null,
    codigoResgate: codigo,
    status: "enviado",
  });

  cupom.status = "presenteado";
  await AppDataSource.getRepository(CupomUsuario).save(cupom);

  await incrementarMissao(data.remetenteId, "presentes");
  if (destinatarioId) {
    await criarNotificacao(
      destinatarioId,
      "Você ganhou um presente!",
      `${data.destinatarioNome ?? "Alguém"} enviou um cupom para você.`,
      "presente"
    );
  }

  return {
    presenteId: presente.id,
    codigoResgate: codigo,
    link: `/presentes/cupom/${codigo}`,
  };
}

export async function criarPedidoPresente(data: {
  remetenteId: number;
  itens: { produtoId: number; quantidade: number }[];
  pontosUsados: number;
  valorReais: number;
  walletUsado?: number;
  valorPix?: number;
  destinatario: {
    nome: string;
    email?: string;
    telefone?: string;
    cpf?: string;
    usuarioId?: number;
  };
  endereco: Record<string, unknown>;
  mensagem?: string;
  embrulho?: boolean;
  enviarSurpresa?: boolean;
  isPessoal?: boolean;
}) {
  const nivel = await AppDataSource.getRepository(Usuario)
    .createQueryBuilder("u")
    .innerJoin("u.nivel", "n")
    .select([
      "n.podePresentearProduto AS pode_presentear_produto",
      "n.valorMaxPresente AS valor_max_presente",
    ])
    .where("u.id = :id", { id: data.remetenteId })
    .getRawOne<{
      pode_presentear_produto: boolean;
      valor_max_presente: string | null;
    }>();

  // Validações de nível só se aplicam a PRESENTES (não para compras pessoais)
  if (!data.isPessoal) {
    if (!nivel?.pode_presentear_produto) {
      return { erro: "Seu nível não permite presentear produtos físicos" };
    }
    if (
      nivel.valor_max_presente !== null &&
      data.valorReais > Number(nivel.valor_max_presente)
    ) {
      return {
        erro: `Valor máximo para presente no seu nível: R$ ${nivel.valor_max_presente}`,
      };
    }
  }

  const walletUsado = data.walletUsado ?? 0;
  const valorPix = data.valorPix ?? data.valorReais;
  const aguardaPix = valorPix > 0;

  return AppDataSource.transaction(async (manager) => {
    if (walletUsado > 0) {
      const debito = await debitarWallet(
        data.remetenteId,
        walletUsado,
        "Pagamento de presente (carteira)",
        manager
      );
      if (debito && "erro" in debito) return debito;
    }

    const pedido = await manager.getRepository(PedidoPresente).save({
      remetenteId: data.remetenteId,
      destinatarioId: data.destinatario.usuarioId ?? null,
      destinatarioNome: data.destinatario.nome,
      destinatarioEmail: data.destinatario.email ?? null,
      destinatarioTelefone: data.destinatario.telefone ?? null,
      destinatarioCpf: data.destinatario.cpf ?? null,
      enderecoJson: data.endereco,
      mensagem: data.mensagem ?? null,
      embrulho: data.embrulho ?? false,
      enviarSurpresa: data.enviarSurpresa ?? false,
      valorReais: String(data.valorReais),
      pontosUsados: data.pontosUsados,
      walletUsado: String(walletUsado.toFixed(2)),
      valorPix: String(valorPix.toFixed(2)),
      status: aguardaPix ? "aguardando_pagamento" : "pago",
    });

    for (const item of data.itens) {
      const prod = await manager.getRepository(Produto).findOne({
        where: { id: item.produtoId, ativo: true },
      });
      if (!prod) throw new Error("Produto inválido");
      if (prod.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para "${prod.nome}" (disponível: ${prod.estoque})`);
      }

      // Decrementa estoque
      await manager
        .getRepository(Produto)
        .decrement({ id: item.produtoId }, "estoque", item.quantidade);

      await manager.getRepository(PedidoPresenteItem).save({
        pedidoId: pedido.id,
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: prod.precoReais,
        pontosUnitarios: prod.precoPontos,
      });
    }

    if (data.pontosUsados > 0) {
      await manager
        .getRepository(Usuario)
        .decrement({ id: data.remetenteId }, "pontos", data.pontosUsados);
    }

    await incrementarMissao(data.remetenteId, "presentes", 1, manager);

    return {
      pedidoId: pedido.id,
      status: pedido.status,
      aguardaPix,
      valorPix: valorPix > 0 ? valorPix : undefined,
    };
  });
}

export async function confirmarPagamentoPedido(
  usuarioId: number,
  pedidoId: string
) {
  const pedido = await AppDataSource.getRepository(PedidoPresente).findOne({
    where: { id: pedidoId, remetenteId: usuarioId },
  });

  if (!pedido) return { erro: "Pedido não encontrado" };
  if (pedido.status !== "aguardando_pagamento") {
    return { erro: "Este pedido não está aguardando pagamento" };
  }

  pedido.status = "pago";
  await AppDataSource.getRepository(PedidoPresente).save(pedido);

  return { pedidoId: pedido.id, status: "pago" };
}

export async function buscarPresentePorCodigo(codigo: string) {
  const presente = await AppDataSource.getRepository(PresenteCupom)
    .createQueryBuilder("p")
    .innerJoin("p.cupom", "cu")
    .innerJoin("cu.template", "ct")
    .innerJoin("p.remetente", "r")
    .select([
      "p.id AS id",
      "p.status AS status",
      "p.mensagem AS mensagem",
      "p.destinatarioNome AS destinatario_nome",
      "p.canal AS canal",
      "cu.codigo AS cupom_codigo",
      "cu.validadeAte AS validade_ate",
      "ct.titulo AS cupom_titulo",
      "ct.categoria AS cupom_categoria",
      "r.nome AS remetente_nome",
    ])
    .where("p.codigoResgate = :codigo", { codigo })
    .getRawOne();

  if (!presente) return null;
  if (presente.status === "expirado") return { erro: "Presente expirado" };
  if (presente.status === "resgatado") return { erro: "Presente já resgatado" };

  return {
    id: presente.id,
    status: presente.status,
    mensagem: presente.mensagem,
    destinatarioNome: presente.destinatario_nome,
    canal: presente.canal,
    cupom: {
      codigo: presente.cupom_codigo,
      titulo: presente.cupom_titulo,
      categoria: presente.cupom_categoria,
      validadeAte: presente.validade_ate,
    },
    remetenteNome: presente.remetente_nome,
  };
}

export async function resgatarPresenteCupom(usuarioId: number, codigo: string) {
  return AppDataSource.transaction(async (manager) => {
    const presenteRepo = manager.getRepository(PresenteCupom);
    const presente = await presenteRepo.findOne({
      where: { codigoResgate: codigo, status: "enviado" },
      relations: ["cupom"],
    });

    if (!presente) return { erro: "Presente inválido ou já resgatado" };

    const cupom = presente.cupom;
    if (!cupom || cupom.status !== "presenteado") {
      return { erro: "Cupom não disponível para resgate" };
    }

    cupom.usuarioId = usuarioId;
    cupom.status = "disponivel";
    cupom.origem = "presente";
    await manager.getRepository(CupomUsuario).save(cupom);

    presente.status = "resgatado";
    presente.destinatarioId = usuarioId;
    await presenteRepo.save(presente);

    await criarNotificacao(
      usuarioId,
      "Presente resgatado!",
      `O cupom ${cupom.codigo} foi adicionado à sua carteira.`,
      "presente",
      manager
    );

    if (presente.remetenteId !== usuarioId) {
      await criarNotificacao(
        presente.remetenteId,
        "Presente resgatado",
        "Seu presente de cupom foi resgatado pelo destinatário.",
        "presente",
        manager
      );
    }

    await verificarConquistas(presente.remetenteId, manager);

    const template = await manager.getRepository(CupomTemplate).findOne({
      where: { id: cupom.templateId },
    });

    return {
      cupomId: cupom.id,
      codigo: cupom.codigo,
      titulo: template?.titulo ?? "Cupom",
    };
  });
}

export async function avancarStatusPedido(usuarioId: number, pedidoId: string) {
  const pedido = await AppDataSource.getRepository(PedidoPresente).findOne({
    where: [
      { id: pedidoId, remetenteId: usuarioId },
      { id: pedidoId, destinatarioId: usuarioId },
    ],
  });
  if (!pedido) return { erro: "Pedido não encontrado" };

  const fluxo: Record<string, string> = {
    pago: "enviado",
    enviado: "a_caminho",
    a_caminho: "entregue",
  };
  const proximo = fluxo[pedido.status];
  if (!proximo) return { erro: "Status não pode ser avançado" };

  pedido.status = proximo as PedidoPresente["status"];
  await AppDataSource.getRepository(PedidoPresente).save(pedido);
  return { pedidoId: pedido.id, status: pedido.status };
}

export async function listarPedidosPresente(usuarioId: number) {
  return AppDataSource.getRepository(PedidoPresente)
    .createQueryBuilder("p")
    .select([
      "p.id AS id",
      "p.destinatarioNome AS destinatario_nome",
      "p.status AS status",
      "p.valorReais AS valor_reais",
      "p.pontosUsados AS pontos_usados",
      "p.codigoRastreio AS codigo_rastreio",
      "p.criadoEm AS criado_em",
      "p.atualizadoEm AS atualizado_em",
    ])
    .where("p.remetenteId = :usuarioId OR p.destinatarioId = :usuarioId", {
      usuarioId,
    })
    .orderBy("p.criadoEm", "DESC")
    .getRawMany();
}
