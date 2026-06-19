import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Usuario } from "./Usuario";

@Entity("endereco")
export class Endereco {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ name: "usuario_id", unsigned: true })
  usuarioId!: number;

  @Column({ type: "varchar", length: 60, nullable: true })
  apelido!: string | null;

  @Column({ type: "char", length: 8 })
  cep!: string;

  @Column({ length: 200 })
  logradouro!: string;

  @Column({ length: 20 })
  numero!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  complemento!: string | null;

  @Column({ length: 100 })
  bairro!: string;

  @Column({ length: 100 })
  cidade!: string;

  @Column({ type: "char", length: 2 })
  uf!: string;

  @Column({ type: "tinyint", width: 1, default: 0 })
  principal!: boolean;

  @ManyToOne(() => Usuario, (u) => u.enderecos, { onDelete: "CASCADE" })
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;
}
