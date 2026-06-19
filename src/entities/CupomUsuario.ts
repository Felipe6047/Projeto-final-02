import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuario } from "./Usuario";
import { CupomTemplate } from "./CupomTemplate";

export type StatusCupom =
  | "disponivel"
  | "oferecido_troca"
  | "em_troca"
  | "resgatado"
  | "presenteado"
  | "expirado";

export type OrigemCupom =
  | "compra"
  | "missao"
  | "campanha"
  | "presente"
  | "troca"
  | "resgate";

@Entity("cupom_usuario")
export class CupomUsuario {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: string;

  @Column({ name: "usuario_id", unsigned: true })
  usuarioId!: number;

  @Column({ name: "template_id", unsigned: true })
  templateId!: number;

  @Column({ length: 40, unique: true })
  codigo!: string;

  @Column({
    type: "enum",
    enum: ["disponivel", "oferecido_troca", "em_troca", "resgatado", "presenteado", "expirado"],
    default: "disponivel",
  })
  status!: StatusCupom;

  @Column({ name: "validade_ate", type: "date" })
  validadeAte!: string;

  @Column({
    type: "enum",
    enum: ["compra", "missao", "campanha", "presente", "troca", "resgate"],
    default: "compra",
  })
  origem!: OrigemCupom;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @ManyToOne(() => Usuario, (u) => u.cupons)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;

  @ManyToOne(() => CupomTemplate, (t) => t.cupons)
  @JoinColumn({ name: "template_id" })
  template!: CupomTemplate;
}
