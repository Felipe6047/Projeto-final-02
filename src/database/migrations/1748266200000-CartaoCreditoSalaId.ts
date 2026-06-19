import { MigrationInterface, QueryRunner } from "typeorm";

export class CartaoCreditoSalaId1748266200000 implements MigrationInterface {
  name = "CartaoCreditoSalaId1748266200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela cartao_credito
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cartao_credito (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        usuario_id INT UNSIGNED NOT NULL,
        apelido VARCHAR(60) NULL,
        numero VARCHAR(19) NOT NULL,
        nome_titular VARCHAR(100) NOT NULL,
        validade VARCHAR(5) NOT NULL,
        cvv VARCHAR(4) NOT NULL,
        principal TINYINT(1) NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        CONSTRAINT fk_cartao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Adicionar coluna sala_id na tabela proposta_troca (nullable para não quebrar dados existentes)
    await queryRunner.query(`
      ALTER TABLE proposta_troca
        ADD COLUMN sala_id INT UNSIGNED NULL AFTER cupom_proprietario_id
    `);

    // Adicionar FK para sala_troca com CASCADE (se a sala for deletada, as propostas somem)
    await queryRunner.query(`
      ALTER TABLE proposta_troca
        ADD CONSTRAINT fk_proposta_sala FOREIGN KEY (sala_id) REFERENCES sala_troca(id) ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE proposta_troca DROP FOREIGN KEY fk_proposta_sala`);
    await queryRunner.query(`ALTER TABLE proposta_troca DROP COLUMN sala_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS cartao_credito`);
  }
}
