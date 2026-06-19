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
import { Usuario } from "./Usuario";
import { PedidoPresenteItem } from "./PedidoPresenteItem";

export type StatusPedidoPresente =
  | "pendente"
  | "aguardando_pagamento"
  | "pago"
  | "enviado"
  | "a_caminho"
  | "entregue"
  | "cancelado";

@Entity("pedido_presente")
export class PedidoPresente {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: string;

  @Column({ name: "remetente_id", unsigned: true })
  remetenteId!: number;

  @Column({ name: "destinatario_id", type: "int", unsigned: true, nullable: true })
  destinatarioId!: number | null;

  @Column({ name: "destinatario_nome", length: 120 })
  destinatarioNome!: string;

  @Column({ name: "destinatario_email", type: "varchar", length: 180, nullable: true })
  destinatarioEmail!: string | null;

  @Column({ name: "destinatario_telefone", type: "varchar", length: 20, nullable: true })
  destinatarioTelefone!: string | null;

  @Column({ name: "destinatario_cpf", type: "char", length: 11, nullable: true })
  destinatarioCpf!: string | null;

  @Column({ name: "endereco_json", type: "json" })
  enderecoJson!: Record<string, unknown>;

  @Column({ type: "varchar", length: 500, nullable: true })
  mensagem!: string | null;

  @Column({ type: "tinyint", width: 1, default: 0 })
  embrulho!: boolean;

  @Column({ name: "enviar_surpresa", type: "tinyint", width: 1, default: 0 })
  enviarSurpresa!: boolean;

  @Column({ name: "valor_reais", type: "decimal", precision: 10, scale: 2, default: 0 })
  valorReais!: string;

  @Column({ name: "pontos_usados", type: "int", unsigned: true, default: 0 })
  pontosUsados!: number;

  @Column({
    name: "wallet_usado",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  walletUsado!: string;

  @Column({
    name: "valor_pix",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  valorPix!: string;

  @Column({
    type: "enum",
    enum: [
      "pendente",
      "aguardando_pagamento",
      "pago",
      "enviado",
      "a_caminho",
      "entregue",
      "cancelado",
    ],
    default: "pendente",
  })
  status!: StatusPedidoPresente;

  @Column({ name: "codigo_rastreio", type: "varchar", length: 60, nullable: true })
  codigoRastreio!: string | null;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @UpdateDateColumn({ name: "atualizado_em" })
  atualizadoEm!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "remetente_id" })
  remetente!: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "destinatario_id" })
  destinatario!: Usuario | null;

  @OneToMany(() => PedidoPresenteItem, (i) => i.pedido)
  itens!: PedidoPresenteItem[];
}
