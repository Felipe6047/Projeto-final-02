import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Usuario } from "./Usuario";

@Entity("cartao_credito")
export class CartaoCredito {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ name: "usuario_id", unsigned: true })
  usuarioId!: number;

  @Column({ type: "varchar", length: 60, nullable: true })
  apelido!: string | null;

  @Column({ type: "varchar", length: 19 })
  numero!: string;

  @Column({ name: "nome_titular", type: "varchar", length: 100 })
  nomeTitular!: string;

  @Column({ type: "varchar", length: 5 })
  validade!: string;

  @Column({ type: "varchar", length: 4 })
  cvv!: string;

  @Column({ type: "tinyint", width: 1, default: 0 })
  principal!: boolean;

  @ManyToOne(() => Usuario, (u: any) => u.cartoes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;
}
