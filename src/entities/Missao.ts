import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export type TipoMetaMissao = "compras" | "trocas" | "presentes" | "pontos";

@Entity("missao")
export class Missao {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ length: 120 })
  titulo!: string;

  @Column({ type: "text", nullable: true })
  descricao!: string | null;

  @Column({ name: "pontos_recompensa", type: "int", unsigned: true })
  pontosRecompensa!: number;

  @Column({ name: "meta_valor", type: "int", unsigned: true, default: 1 })
  metaValor!: number;

  @Column({ name: "tipo_meta", type: "enum", enum: ["compras", "trocas", "presentes", "pontos"] })
  tipoMeta!: TipoMetaMissao;

  @Column({ type: "tinyint", width: 1, default: 1 })
  ativa!: boolean;

  @Column({ name: "inicio_em", type: "date", nullable: true })
  inicioEm!: string | null;

  @Column({ name: "fim_em", type: "date", nullable: true })
  fimEm!: string | null;
}
