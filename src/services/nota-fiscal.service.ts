import { AppDataSource } from "../config/database";
import { NotaFiscal } from "../entities/NotaFiscal";
import { Usuario } from "../entities/Usuario";
import { registrarCompra } from "./compra.service";

export async function processarNotaFiscal(
  usuarioId: number,
  chave: string,
  vincularCpf?: boolean
) {
  const nota = await AppDataSource.getRepository(NotaFiscal).findOne({
    where: { chave: chave.trim() },
  });

  if (!nota) return { erro: "Nota fiscal não encontrada" };
  if (nota.status === "processada") {
    return { erro: "Esta Nota Fiscal já foi utilizada." };
  }

  const usuario = await AppDataSource.getRepository(Usuario).findOne({
    where: { id: usuarioId },
    select: ["id", "cpf"],
  });
  if (!usuario) return { erro: "Usuário não encontrado" };

  if (nota.cpf) {
    const outroComCpf = await AppDataSource.getRepository(Usuario).findOne({
      where: { cpf: nota.cpf },
      select: ["id", "cpf"],
    });

    if (outroComCpf && outroComCpf.id !== usuarioId) {
      return {
        erro: "Esta nota fiscal pertence a outro usuário cadastrado.",
      };
    }

    if (!usuario.cpf && !vincularCpf && vincularCpf !== false) {
      return {
        status: "confirmacao_pendente",
        cpfNota: nota.cpf,
        valorTotal: Number(nota.valorTotal),
      };
    }

    if (!usuario.cpf && vincularCpf === true) {
      usuario.cpf = nota.cpf;
      await AppDataSource.getRepository(Usuario).save(usuario);
    }
  }

  const valor = Number(nota.valorTotal);
  const resultado = await registrarCompra(usuarioId, valor);
  if ("erro" in resultado) return resultado;

  nota.status = "processada";
  nota.usuarioId = usuarioId;
  nota.processadaEm = new Date();
  await AppDataSource.getRepository(NotaFiscal).save(nota);

  return {
    status: "processada",
    pontosGerados: resultado.pontosGerados,
    valorTotal: valor,
    saldoPontos: resultado.saldoPontos,
  };
}
