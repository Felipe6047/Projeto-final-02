import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("evento_sazonal")
export class EventoSazonal {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ length: 120 })
  titulo!: string;

  @Column({ type: "text", nullable: true })
  descricao!: string | null;

  @Column({ name: "trocas_extras", type: "smallint", unsigned: true, default: 0 })
  trocasExtras!: number;

  @Column({ name: "inicio_em", type: "datetime" })
  inicioEm!: Date;

  @Column({ name: "fim_em", type: "datetime" })
  fimEm!: Date;

  @Column({ type: "tinyint", width: 1, default: 1 })
  ativo!: boolean;
}
