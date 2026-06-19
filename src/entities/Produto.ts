import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("produto")
export class Produto {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ length: 150 })
  nome!: string;

  @Column({ type: "text", nullable: true })
  descricao!: string | null;

  @Column({ length: 100, default: "Outros" })
  categoria!: string;

  @Column({ name: "preco_reais", type: "decimal", precision: 10, scale: 2 })
  precoReais!: string;

  @Column({ name: "preco_pontos", type: "int", unsigned: true, default: 0 })
  precoPontos!: number;

  @Column({ type: "int", unsigned: true, default: 0 })
  estoque!: number;

  @Column({ name: "imagem_url", type: "varchar", length: 500, nullable: true })
  imagemUrl!: string | null;

  @Column({ type: "tinyint", width: 1, default: 1 })
  ativo!: boolean;
}
