import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { SalaTroca } from "./SalaTroca";
import { Usuario } from "./Usuario";

@Entity("sala_troca_membro")
export class SalaTrocaMembro {
  @PrimaryColumn({ name: "sala_id", unsigned: true })
  salaId!: number;

  @PrimaryColumn({ name: "usuario_id", unsigned: true })
  usuarioId!: number;

  @CreateDateColumn({ name: "entrado_em" })
  entradoEm!: Date;

  @ManyToOne(() => SalaTroca, (s) => s.membros, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sala_id" })
  sala!: SalaTroca;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;
}
