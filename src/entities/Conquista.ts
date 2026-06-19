import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("conquista")
export class Conquista {
  @PrimaryGeneratedColumn({ type: "smallint", unsigned: true })
  id!: number;

  @Column({ length: 40, unique: true })
  slug!: string;

  @Column({ length: 80 })
  nome!: string;

  @Column({ length: 255 })
  descricao!: string;

  @Column({ length: 40 })
  icone!: string;
}
