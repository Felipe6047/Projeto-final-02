import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuario } from "./Usuario";

export type TipoHistoricoPontos =
  | "compra"
  | "resgate"
  | "troca_taxa"
  | "missao"
  | "campanha"
  | "presente"
  | "ajuste_admin";

@Entity("historico_pontos")
export class HistoricoPontos {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: string;

  @Column({ name: "usuario_id", unsigned: true })
  usuarioId!: number;

  @Column()
  valor!: number;

  @Column({ name: "saldo_apos", type: "int", unsigned: true })
  saldoApos!: number;

  @Column({ type: "enum", enum: ["compra", "resgate", "troca_taxa", "missao", "campanha", "presente", "ajuste_admin"] })
  tipo!: TipoHistoricoPontos;

  @Column({ name: "referencia_tipo", type: "varchar", length: 40, nullable: true })
  referenciaTipo!: string | null;

  @Column({ name: "referencia_id", type: "bigint", unsigned: true, nullable: true })
  referenciaId!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  descricao!: string | null;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;
}
