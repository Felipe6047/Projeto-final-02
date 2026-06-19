import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Usuario } from "./Usuario";
import { Missao } from "./Missao";

@Entity("usuario_missao")
export class UsuarioMissao {
  @PrimaryColumn({ name: "usuario_id", unsigned: true })
  usuarioId!: number;

  @PrimaryColumn({ name: "missao_id", unsigned: true })
  missaoId!: number;

  @Column({ type: "int", unsigned: true, default: 0 })
  progresso!: number;

  @Column({ type: "tinyint", width: 1, default: 0 })
  concluida!: boolean;

  @Column({ name: "concluida_em", type: "datetime", nullable: true })
  concluidaEm!: Date | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;

  @ManyToOne(() => Missao)
  @JoinColumn({ name: "missao_id" })
  missao!: Missao;
}
