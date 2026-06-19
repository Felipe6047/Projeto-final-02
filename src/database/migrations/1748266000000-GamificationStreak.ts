import { MigrationInterface, QueryRunner } from "typeorm";

export class GamificationStreak1748266000000 implements MigrationInterface {
  name = "GamificationStreak1748266000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`usuario\` ADD \`dias_ofensiva\` int UNSIGNED NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE \`usuario\` ADD \`ultimo_acesso\` datetime NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`usuario\` DROP COLUMN \`ultimo_acesso\``
    );
    await queryRunner.query(
      `ALTER TABLE \`usuario\` DROP COLUMN \`dias_ofensiva\``
    );
  }
}
