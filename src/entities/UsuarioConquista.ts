import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Usuario } from "./Usuario";
import { Conquista } from "./Conquista";

@Entity("usuario_conquista")
export class UsuarioConquista {
  @PrimaryColumn({ name: "usuario_id", unsigned: true })
  usuarioId!: number;

  @PrimaryColumn({ name: "conquista_id", type: "smallint", unsigned: true })
  conquistaId!: number;

  @CreateDateColumn({ name: "desbloqueada_em" })
  desbloqueadaEm!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;

  @ManyToOne(() => Conquista)
  @JoinColumn({ name: "conquista_id" })
  conquista!: Conquista;
}
