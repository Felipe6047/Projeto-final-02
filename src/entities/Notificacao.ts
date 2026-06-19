import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuario } from "./Usuario";

@Entity("notificacao")
export class Notificacao {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: string;

  @Column({ name: "usuario_id", unsigned: true })
  usuarioId!: number;

  @Column({ length: 120 })
  titulo!: string;

  @Column({ length: 500 })
  mensagem!: string;

  @Column({ length: 40 })
  tipo!: string;

  @Column({ type: "tinyint", width: 1, default: 0 })
  lida!: boolean;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;
}
