import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuario } from "./Usuario";

@Entity("compra")
export class Compra {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: string;

  @Column({ name: "usuario_id", unsigned: true })
  usuarioId!: number;

  @Column({ name: "valor_total", type: "decimal", precision: 10, scale: 2 })
  valorTotal!: string;

  @Column({ name: "pontos_gerados", type: "int", unsigned: true, default: 0 })
  pontosGerados!: number;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;
}
