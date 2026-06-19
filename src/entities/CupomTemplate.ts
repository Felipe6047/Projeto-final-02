import { Column, Entity, OneToMany, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { CupomUsuario } from "./CupomUsuario";

@Entity("cupom_template")
export class CupomTemplate {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ length: 120 })
  titulo!: string;

  @Column({ type: "text", nullable: true })
  descricao!: string | null;

  @Column({ length: 60 })
  categoria!: string;

  @Column({ name: "desconto_percentual", type: "decimal", precision: 5, scale: 2, nullable: true })
  descontoPercentual!: string | null;

  @Column({ name: "desconto_valor", type: "decimal", precision: 10, scale: 2, nullable: true })
  descontoValor!: string | null;

  @Column({ name: "valor_minimo_compra", type: "decimal", precision: 10, scale: 2, nullable: true })
  valorMinimoCompra!: string | null;

  @Column({ name: "imagem_url", type: "varchar", length: 500, nullable: true })
  imagemUrl!: string | null;

  @Column({ name: "dias_validade", type: "smallint", unsigned: true, default: 30 })
  diasValidade!: number;

  @Column({ name: "preco_pontos", type: "int", unsigned: true, default: 500 })
  precoPontos!: number;

  @Column({ type: "tinyint", width: 1, default: 1 })
  ativo!: boolean;

  @Column({ name: "limite_por_usuario", type: "int", unsigned: true, nullable: true })
  limitePorUsuario!: number | null;

  @Column({ name: "limite_total", type: "int", unsigned: true, nullable: true })
  limiteTotal!: number | null;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;

  @OneToMany(() => CupomUsuario, (c) => c.template)
  cupons!: CupomUsuario[];
}
