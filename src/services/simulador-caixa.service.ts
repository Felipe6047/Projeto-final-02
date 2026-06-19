import crypto from "crypto";
import { AppDataSource } from "../config/database";
import { NotaFiscal } from "../entities/NotaFiscal";
import { Usuario } from "../entities/Usuario";
import { registrarCompra } from "./compra.service";

function gerarChaveNfce() {
  const base = Date.now().toString().padStart(13, "0");
  const rand = crypto.randomBytes(15).toString("hex").slice(0, 31);
  return (base + rand).slice(0, 44).padEnd(44, "0");
}

export async function registrarVendaPorCpf(cpf: string, valorTotal: number) {
  const usuario = await AppDataSource.getRepository(Usuario).findOne({
    where: { cpf: cpf.replace(/\D/g, "") },
    select: ["id"],
  });

  if (!usuario) {
    return { erro: "Nenhum cliente cadastrado com este CPF" };
  }

  const resultado = await registrarCompra(usuario.id, valorTotal);
  if ("erro" in resultado) return resultado;

  return {
    usuarioId: usuario.id,
    valorTotal,
    pontosGerados: resultado.pontosGerados,
    saldoPontos: resultado.saldoPontos,
  };
}

export async function gerarNotaFiscal(valorTotal: number, cpf?: string) {
  if (valorTotal <= 0) return { erro: "Valor deve ser positivo" };

  let chave = gerarChaveNfce();
  const repo = AppDataSource.getRepository(NotaFiscal);
  let tentativas = 0;
  while (await repo.findOne({ where: { chave } })) {
    chave = gerarChaveNfce();
    tentativas += 1;
    if (tentativas > 5) return { erro: "Não foi possível gerar chave da nota" };
  }

  const cpfLimpo = cpf?.replace(/\D/g, "") || null;
  await repo.save({
    chave,
    valorTotal: String(valorTotal.toFixed(2)),
    cpf: cpfLimpo && cpfLimpo.length === 11 ? cpfLimpo : null,
    status: "disponivel",
  });

  return {
    chave,
    valorTotal,
    cpf: cpfLimpo,
    pontosEstimados: Math.floor(valorTotal),
  };
}
