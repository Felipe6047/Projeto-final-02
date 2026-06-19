import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuario } from "./Usuario";
import { CupomUsuario } from "./CupomUsuario";
import { SalaTroca } from "./SalaTroca";

export type StatusProposta = "pendente" | "aceita" | "recusada" | "cancelada";

@Entity("proposta_troca")
export class PropostaTroca {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: string;

  @Column({ name: "solicitante_id", unsigned: true })
  solicitanteId!: number;

  @Column({ name: "proprietario_id", unsigned: true })
  proprietarioId!: number;

  @Column({ name: "cupom_solicitante_id", type: "bigint", unsigned: true })
  cupomSolicitanteId!: string;

  @Column({ name: "cupom_proprietario_id", type: "bigint", unsigned: true })
  cupomProprietarioId!: string;

  @Column({ name: "sala_id", type: "int", unsigned: true, nullable: true })
  salaId!: number | null;

  @Column({ type: "enum", enum: ["pendente", "aceita", "recusada", "cancelada"], default: "pendente" })
  status!: StatusProposta;

  @Column({ name: "taxa_pontos", type: "int", unsigned: true, default: 0 })
  taxaPontos!: number;

  @Column({ name: "taxa_aceita", type: "tinyint", width: 1, default: 0 })
  taxaAceita!: boolean;

  @Column({ name: "respondido_em", type: "datetime", nullable: true })
  respondidoEm!: Date | null;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "solicitante_id" })
  solicitante!: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "proprietario_id" })
  proprietario!: Usuario;

  @ManyToOne(() => CupomUsuario)
  @JoinColumn({ name: "cupom_solicitante_id" })
  cupomSolicitante!: CupomUsuario;

  @ManyToOne(() => CupomUsuario)
  @JoinColumn({ name: "cupom_proprietario_id" })
  cupomProprietario!: CupomUsuario;

  @ManyToOne(() => SalaTroca, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "sala_id" })
  sala!: SalaTroca | null;
}
