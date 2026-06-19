import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PedidoPresente } from "./PedidoPresente";
import { Produto } from "./Produto";

@Entity("pedido_presente_item")
export class PedidoPresenteItem {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: string;

  @Column({ name: "pedido_id", type: "bigint", unsigned: true })
  pedidoId!: string;

  @Column({ name: "produto_id", unsigned: true })
  produtoId!: number;

  @Column({ type: "smallint", unsigned: true, default: 1 })
  quantidade!: number;

  @Column({ name: "preco_unitario", type: "decimal", precision: 10, scale: 2 })
  precoUnitario!: string;

  @Column({ name: "pontos_unitarios", type: "int", unsigned: true, default: 0 })
  pontosUnitarios!: number;

  @ManyToOne(() => PedidoPresente, (p) => p.itens, { onDelete: "CASCADE" })
  @JoinColumn({ name: "pedido_id" })
  pedido!: PedidoPresente;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: "produto_id" })
  produto!: Produto;
}
