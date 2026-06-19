import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("campanha")
export class Campanha {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ length: 120 })
  titulo!: string;

  @Column({ type: "text", nullable: true })
  descricao!: string | null;

  @Column({ name: "segmento_json", type: "json", nullable: true })
  segmentoJson!: object | null;

  @Column({ name: "inicio_em", type: "datetime" })
  inicioEm!: Date;

  @Column({ name: "fim_em", type: "datetime" })
  fimEm!: Date;

  @Column({ type: "tinyint", width: 1, default: 1 })
  ativa!: boolean;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;
}
