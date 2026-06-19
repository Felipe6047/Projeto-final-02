import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { env } from "../config/env";
import { JwtPayload } from "../middleware/auth";
import { Usuario } from "../entities/Usuario";
import { HistoricoPontos } from "../entities/HistoricoPontos";

export async function login(email: string, senha: string) {
  const user = await AppDataSource.getRepository(Usuario).findOne({
    where: { email, ativo: true },
    select: {
      id: true,
      nome: true,
      email: true,
      senhaHash: true,
      nivelId: true,
      pontos: true,
      papel: true,
    },
  });

  if (!user) return null;

  const valid = await bcrypt.compare(senha, user.senhaHash);
  if (!valid) return null;

  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    nivelId: user.nivelId,
    papel: user.papel ?? "cliente",
  };

  const signOptions: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions["expiresIn"],
  };
  const token = jwt.sign(payload, env.jwt.secret, signOptions);

  return {
    token,
    usuario: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      nivelId: user.nivelId,
      pontos: user.pontos,
      papel: user.papel ?? "cliente",
    },
  };
}

function cpfValido(cpf: string) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(d[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(d[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(d[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(d[10]);
}

export async function registrar(data: {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  cpf: string;
}) {
  const cpf = data.cpf.replace(/\D/g, "");
  if (!cpfValido(cpf)) {
    return { erro: "CPF inválido. Digite um CPF válido (apenas números)." };
  }

  const repo = AppDataSource.getRepository(Usuario);
  const cpfExiste = await repo.findOne({ where: { cpf }, select: ["id"] });
  if (cpfExiste) {
    return {
      erro: "CPF já cadastrado. Faça login ou recupere sua senha.",
    };
  }

  const emailExiste = await repo.findOne({
    where: { email: data.email },
    select: ["id"],
  });
  if (emailExiste) {
    return { erro: "E-mail já cadastrado." };
  }

  const hash = await bcrypt.hash(data.senha, 10);
  await repo.save({
    nome: data.nome,
    email: data.email,
    telefone: data.telefone ?? null,
    cpf,
    senhaHash: hash,
    kycStatus: "pendente",
  });

  return login(data.email, data.senha);
}

export async function buscarPerfil(usuarioId: number) {
  const repo = AppDataSource.getRepository(Usuario);

  // Lógica da Ofensiva (Streak)
  const u = await repo.findOne({ where: { id: usuarioId }, select: ["id", "diasOfensiva", "ultimoAcesso"] });
  if (u) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const ultimo = u.ultimoAcesso ? new Date(u.ultimoAcesso) : null;
    if (ultimo) ultimo.setHours(0, 0, 0, 0);

    let needsUpdate = false;
    let novaOfensiva = u.diasOfensiva;

    if (!ultimo) {
      novaOfensiva = 1;
      needsUpdate = true;
    } else {
      const diffTime = Math.abs(hoje.getTime() - ultimo.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        novaOfensiva += 1;
        needsUpdate = true;
      } else if (diffDays > 1) {
        novaOfensiva = 1;
        needsUpdate = true;
      } else if (u.diasOfensiva === 0) {
         novaOfensiva = 1;
         needsUpdate = true;
      }
    }

    if (needsUpdate || !u.ultimoAcesso) {
      await repo.update(usuarioId, { diasOfensiva: novaOfensiva, ultimoAcesso: new Date() });
    }
  }

  const row = await repo
    .createQueryBuilder("u")
    .innerJoin("u.nivel", "n")
    .select([
      "u.id AS id",
      "u.nome AS nome",
      "u.email AS email",
      "u.telefone AS telefone",
      "u.cpf AS cpf",
      "u.pontos AS pontos",
      "u.saldoWallet AS saldo_wallet",
      "u.kycStatus AS kyc_status",
      "u.avatarUrl AS avatar_url",
      "u.papel AS papel",
      "u.diasOfensiva AS dias_ofensiva",
      "n.nome AS nivel",
      "n.slug AS nivel_slug",
      "n.ordem AS nivel_ordem",
    ])
    .where("u.id = :id", { id: usuarioId })
    .getRawOne();

  return row ?? null;
}

export async function buscarUsuarios(q: string, limite = 10) {
  const termo = q.trim();
  if (termo.length < 2) return [];

  const qb = AppDataSource.getRepository(Usuario)
    .createQueryBuilder("u")
    .innerJoin("u.nivel", "n")
    .select([
      "u.id AS id",
      "u.nome AS nome",
      "u.email AS email",
      "u.cpf AS cpf",
      "n.nome AS nivel",
    ])
    .where("u.ativo = 1")
    .andWhere(
      "(u.nome LIKE :termo OR u.email LIKE :termo OR u.cpf LIKE :termo)",
      { termo: `%${termo}%` }
    )
    .limit(Math.min(limite, 20));

  return qb.getRawMany();
}

export async function verificarKyc(usuarioId: number) {
  const repo = AppDataSource.getRepository(Usuario);
  const usuario = await repo.findOne({
    where: { id: usuarioId },
    select: ["id", "kycStatus"],
  });
  if (!usuario) return { erro: "Usuário não encontrado" };
  if (usuario.kycStatus === "aprovado") {
    return { kycStatus: "aprovado" };
  }

  usuario.kycStatus = "aprovado";
  await repo.save(usuario);
  return { kycStatus: "aprovado" };
}

export async function historicoPontos(usuarioId: number, limite = 30) {
  return AppDataSource.getRepository(HistoricoPontos)
    .createQueryBuilder("h")
    .select([
      "h.id AS id",
      "h.valor AS valor",
      "h.saldoApos AS saldo_apos",
      "h.tipo AS tipo",
      "h.descricao AS descricao",
      "h.criadoEm AS criado_em",
    ])
    .where("h.usuarioId = :usuarioId", { usuarioId })
    .orderBy("h.criadoEm", "DESC")
    .limit(limite)
    .getRawMany();
}
