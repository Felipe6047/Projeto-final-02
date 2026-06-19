import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class CouponLimits1748265900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("cupom_template", [
      new TableColumn({
        name: "limite_por_usuario",
        type: "int",
        unsigned: true,
        isNullable: true,
      }),
      new TableColumn({
        name: "limite_total",
        type: "int",
        unsigned: true,
        isNullable: true,
      }),
      new TableColumn({
        name: "criado_em",
        type: "datetime",
        default: "CURRENT_TIMESTAMP",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("cupom_template", "limite_por_usuario");
    await queryRunner.dropColumn("cupom_template", "limite_total");
    await queryRunner.dropColumn("cupom_template", "criado_em");
  }
}
