import { MigrationInterface, QueryRunner } from "typeorm";

export class PlanImplementation1748265800000 implements MigrationInterface {
  name = "PlanImplementation1748265800000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE cupom_template
        ADD COLUMN preco_pontos INT UNSIGNED NOT NULL DEFAULT 500 AFTER dias_validade
    `);

    await queryRunner.query(`
      UPDATE cupom_template SET preco_pontos = 800 WHERE titulo LIKE '%20%'
    `);
    await queryRunner.query(`
      UPDATE cupom_template SET preco_pontos = 600 WHERE titulo LIKE '%cashback%'
    `);
    await queryRunner.query(`
      UPDATE cupom_template SET preco_pontos = 400 WHERE titulo LIKE '%Frete%'
    `);

    await queryRunner.query(`
      ALTER TABLE cupom_usuario
        MODIFY COLUMN origem ENUM('compra','missao','campanha','presente','troca','resgate') NOT NULL DEFAULT 'compra'
    `);


    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS amizade (
        usuario_id  INT UNSIGNED NOT NULL,
        amigo_id    INT UNSIGNED NOT NULL,
        criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (usuario_id, amigo_id),
        KEY idx_amizade_amigo (amigo_id),
        CONSTRAINT fk_amizade_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
        CONSTRAINT fk_amizade_amigo FOREIGN KEY (amigo_id) REFERENCES usuario (id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS amizade`);
    await queryRunner.query(`ALTER TABLE cupom_template DROP COLUMN preco_pontos`);
  }
}
