import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Usuario } from "./Usuario";

@Entity("amizade")
export class Amizade {
  @PrimaryColumn({ name: "usuario_id", unsigned: true })
  usuarioId!: number;

  @PrimaryColumn({ name: "amigo_id", unsigned: true })
  amigoId!: number;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "amigo_id" })
  amigo!: Usuario;
}
