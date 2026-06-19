import { AppDataSource } from "../config/database";
import { Endereco } from "../entities/Endereco";

export async function listarEnderecos(usuarioId: number) {
  return AppDataSource.getRepository(Endereco).find({
    where: { usuarioId },
    order: { principal: "DESC", id: "ASC" },
  });
}

export async function criarEndereco(usuarioId: number, dados: Partial<Endereco>) {
  const repo = AppDataSource.getRepository(Endereco);
  const novoEndereco = repo.create({
    usuarioId,
    apelido: dados.apelido,
    cep: dados.cep?.replace(/\D/g, ""),
    logradouro: dados.logradouro,
    numero: dados.numero,
    complemento: dados.complemento,
    bairro: dados.bairro,
    cidade: dados.cidade,
    uf: dados.uf,
    principal: dados.principal || false,
  });

  if (novoEndereco.principal) {
    await repo.update({ usuarioId }, { principal: false });
  }

  return repo.save(novoEndereco);
}

export async function atualizarEndereco(
  id: number,
  usuarioId: number,
  dados: Partial<Endereco>
) {
  const repo = AppDataSource.getRepository(Endereco);
  const endereco = await repo.findOne({ where: { id, usuarioId } });
  
  if (!endereco) return { erro: "Endereço não encontrado" };

  if (dados.principal) {
    await repo.update({ usuarioId }, { principal: false });
  }

  Object.assign(endereco, {
    apelido: dados.apelido !== undefined ? dados.apelido : endereco.apelido,
    cep: dados.cep ? dados.cep.replace(/\D/g, "") : endereco.cep,
    logradouro: dados.logradouro !== undefined ? dados.logradouro : endereco.logradouro,
    numero: dados.numero !== undefined ? dados.numero : endereco.numero,
    complemento: dados.complemento !== undefined ? dados.complemento : endereco.complemento,
    bairro: dados.bairro !== undefined ? dados.bairro : endereco.bairro,
    cidade: dados.cidade !== undefined ? dados.cidade : endereco.cidade,
    uf: dados.uf !== undefined ? dados.uf : endereco.uf,
    principal: dados.principal !== undefined ? dados.principal : endereco.principal,
  });

  return repo.save(endereco);
}

export async function excluirEndereco(id: number, usuarioId: number) {
  const repo = AppDataSource.getRepository(Endereco);
  const endereco = await repo.findOne({ where: { id, usuarioId } });
  
  if (!endereco) return { erro: "Endereço não encontrado" };

  await repo.remove(endereco);
  return { ok: true };
}
