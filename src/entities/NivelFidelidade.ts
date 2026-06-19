import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Usuario } from "./Usuario";

@Entity("nivel_fidelidade")
export class NivelFidelidade {
  @PrimaryGeneratedColumn({ type: "tinyint", unsigned: true })
  id!: number;

  @Column({ length: 30 })
  nome!: string;

  @Column({ length: 30, unique: true })
  slug!: string;

  @Column({ type: "tinyint", unsigned: true, unique: true })
  ordem!: number;

  @Column({ name: "trocas_mes", type: "smallint", unsigned: true, nullable: true })
  trocasMes!: number | null;

  @Column({ name: "mesmo_rank_apenas", type: "tinyint", width: 1, default: 0 })
  mesmoRankApenas!: boolean;

  @Column({ name: "pode_presentear_cupom", type: "tinyint", width: 1, default: 0 })
  podePresentearCupom!: boolean;

  @Column({ name: "pode_presentear_produto", type: "tinyint", width: 1, default: 0 })
  podePresentearProduto!: boolean;

  @Column({
    name: "valor_max_presente",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  valorMaxPresente!: string | null;

  @Column({ name: "pode_criar_sala_troca", type: "tinyint", width: 1, default: 0 })
  podeCriarSalaTroca!: boolean;

  @Column({ name: "pontos_minimos", type: "int", unsigned: true, default: 0 })
  pontosMinimos!: number;

  @OneToMany(() => Usuario, (u) => u.nivel)
  usuarios!: Usuario[];
}
