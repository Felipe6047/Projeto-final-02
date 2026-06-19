import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuario } from "./Usuario";

export type TipoExtratoWallet = "cashback" | "pagamento" | "estorno";

@Entity("extrato_wallet")
export class ExtratoWallet {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: string;

  @Column({ name: "usuario_id", unsigned: true })
  usuarioId!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  valor!: string;

  @Column({ name: "saldo_apos", type: "decimal", precision: 10, scale: 2 })
  saldoApos!: string;

  @Column({ type: "enum", enum: ["cashback", "pagamento", "estorno"] })
  tipo!: TipoExtratoWallet;

  @Column({ type: "varchar", length: 255, nullable: true })
  descricao!: string | null;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;
}
