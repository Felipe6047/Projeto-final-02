import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CupomUsuario } from "./CupomUsuario";
import { Usuario } from "./Usuario";

export type CanalPresente = "email" | "whatsapp" | "sms" | "link";
export type StatusPresenteCupom = "enviado" | "resgatado" | "expirado";

@Entity("presente_cupom")
export class PresenteCupom {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: string;

  @Column({ name: "cupom_id", type: "bigint", unsigned: true })
  cupomId!: string;

  @Column({ name: "remetente_id", unsigned: true })
  remetenteId!: number;

  @Column({ name: "destinatario_id", type: "int", unsigned: true, nullable: true })
  destinatarioId!: number | null;

  @Column({ name: "destinatario_nome", type: "varchar", length: 120, nullable: true })
  destinatarioNome!: string | null;

  @Column({ name: "destinatario_email", type: "varchar", length: 180, nullable: true })
  destinatarioEmail!: string | null;

  @Column({ name: "destinatario_telefone", type: "varchar", length: 20, nullable: true })
  destinatarioTelefone!: string | null;

  @Column({ name: "destinatario_cpf", type: "char", length: 11, nullable: true })
  destinatarioCpf!: string | null;

  @Column({ type: "enum", enum: ["email", "whatsapp", "sms", "link"] })
  canal!: CanalPresente;

  @Column({ type: "varchar", length: 200, nullable: true })
  mensagem!: string | null;

  @Column({ name: "codigo_resgate", length: 64, unique: true })
  codigoResgate!: string;

  @Column({ type: "enum", enum: ["enviado", "resgatado", "expirado"], default: "enviado" })
  status!: StatusPresenteCupom;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @ManyToOne(() => CupomUsuario)
  @JoinColumn({ name: "cupom_id" })
  cupom!: CupomUsuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "remetente_id" })
  remetente!: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "destinatario_id" })
  destinatario!: Usuario | null;
}
