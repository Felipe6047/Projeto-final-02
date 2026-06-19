import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuario } from "./Usuario";
import { SalaTrocaMembro } from "./SalaTrocaMembro";

@Entity("sala_troca")
export class SalaTroca {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ name: "criador_id", unsigned: true })
  criadorId!: number;

  @Column({ length: 80 })
  nome!: string;

  @Column({ name: "codigo_convite", length: 12, unique: true })
  codigoConvite!: string;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "criador_id" })
  criador!: Usuario;

  @OneToMany(() => SalaTrocaMembro, (m) => m.sala)
  membros!: SalaTrocaMembro[];
}
