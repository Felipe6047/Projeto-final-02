import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { NivelFidelidade } from "./NivelFidelidade";
import { Endereco } from "./Endereco";
import { CartaoCredito } from "./CartaoCredito";
import { CupomUsuario } from "./CupomUsuario";

export type PapelUsuario = "cliente" | "admin";
export type KycStatus = "pendente" | "aprovado";

@Entity("usuario")
export class Usuario {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ length: 120 })
  nome!: string;

  @Column({ length: 180, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  telefone!: string | null;

  @Column({ type: "char", length: 11, nullable: true, unique: true })
  cpf!: string | null;

  @Column({ name: "senha_hash", length: 255 })
  senhaHash!: string;

  @Column({ name: "nivel_id", type: "tinyint", unsigned: true, default: 1 })
  nivelId!: number;

  @Column({ type: "int", unsigned: true, default: 0 })
  pontos!: number;

  @Column({
    name: "saldo_wallet",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  saldoWallet!: string;

  @Column({
    name: "kyc_status",
    type: "enum",
    enum: ["pendente", "aprovado"],
    default: "pendente",
  })
  kycStatus!: KycStatus;

  @Column({ name: "avatar_url", type: "varchar", length: 500, nullable: true })
  avatarUrl!: string | null;

  @Column({ type: "boolean", default: true })
  ativo!: boolean;

  @Column({ name: "dias_ofensiva", type: "int", unsigned: true, default: 0 })
  diasOfensiva!: number;

  @Column({ name: "ultimo_acesso", type: "datetime", nullable: true })
  ultimoAcesso!: Date | null;

  @Column({ type: "enum", enum: ["cliente", "admin"], default: "cliente" })
  papel!: PapelUsuario;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @UpdateDateColumn({ name: "atualizado_em" })
  atualizadoEm!: Date;

  @ManyToOne(() => NivelFidelidade, (n) => n.usuarios)
  @JoinColumn({ name: "nivel_id" })
  nivel!: NivelFidelidade;

  @OneToMany(() => Endereco, (e) => e.usuario)
  enderecos!: Endereco[];

  @OneToMany(() => CartaoCredito, (c) => c.usuario)
  cartoes!: CartaoCredito[];

  @OneToMany(() => CupomUsuario, (c) => c.usuario)
  cupons!: CupomUsuario[];
}
