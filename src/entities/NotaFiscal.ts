import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Usuario } from "./Usuario";

export type StatusNotaFiscal = "disponivel" | "processada";

@Entity("nota_fiscal")
export class NotaFiscal {
  @PrimaryColumn({ length: 44 })
  chave!: string;

  @Column({ name: "valor_total", type: "decimal", precision: 10, scale: 2 })
  valorTotal!: string;

  @Column({ type: "char", length: 11, nullable: true })
  cpf!: string | null;

  @Column({
    type: "enum",
    enum: ["disponivel", "processada"],
    default: "disponivel",
  })
  status!: StatusNotaFiscal;

  @Column({ name: "usuario_id", type: "int", unsigned: true, nullable: true })
  usuarioId!: number | null;

  @Column({ name: "processada_em", type: "datetime", nullable: true })
  processadaEm!: Date | null;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario | null;
}
