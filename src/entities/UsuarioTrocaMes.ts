import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Usuario } from "./Usuario";

@Entity("usuario_troca_mes")
export class UsuarioTrocaMes {
  @PrimaryColumn({ name: "usuario_id", unsigned: true })
  usuarioId!: number;

  @PrimaryColumn({ name: "ano_mes", length: 6 })
  anoMes!: string;

  @Column({ type: "smallint", unsigned: true, default: 0 })
  quantidade!: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;
}
