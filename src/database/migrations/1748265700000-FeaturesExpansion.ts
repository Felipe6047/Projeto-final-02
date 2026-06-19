import { MigrationInterface, QueryRunner } from "typeorm";

export class FeaturesExpansion1748265700000 implements MigrationInterface {
  name = "FeaturesExpansion1748265700000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE usuario
        ADD COLUMN saldo_wallet DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER pontos,
        ADD COLUMN kyc_status ENUM('pendente', 'aprovado') NOT NULL DEFAULT 'pendente' AFTER saldo_wallet
    `);

    await queryRunner.query(`
      ALTER TABLE pedido_presente
        ADD COLUMN wallet_usado DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER pontos_usados,
        ADD COLUMN valor_pix DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER wallet_usado,
        MODIFY COLUMN status ENUM(
          'pendente',
          'aguardando_pagamento',
          'pago',
          'enviado',
          'a_caminho',
          'entregue',
          'cancelado'
        ) NOT NULL DEFAULT 'pendente'
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS nota_fiscal (
        chave           CHAR(44)         NOT NULL,
        valor_total     DECIMAL(10,2)    NOT NULL,
        cpf             CHAR(11)         NULL,
        status          ENUM('disponivel', 'processada') NOT NULL DEFAULT 'disponivel',
        usuario_id      INT UNSIGNED     NULL,
        processada_em   DATETIME         NULL,
        criado_em       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (chave),
        KEY idx_nota_usuario (usuario_id),
        CONSTRAINT fk_nota_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS extrato_wallet (
        id              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
        usuario_id      INT UNSIGNED     NOT NULL,
        valor           DECIMAL(10,2)    NOT NULL,
        saldo_apos      DECIMAL(10,2)    NOT NULL,
        tipo            ENUM('cashback', 'pagamento', 'estorno') NOT NULL,
        descricao       VARCHAR(255)     NULL,
        criado_em       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_extrato_wallet_usuario (usuario_id),
        CONSTRAINT fk_extrato_wallet_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      UPDATE usuario SET kyc_status = 'aprovado' WHERE email = 'admin@frik.demo'
    `);

    await queryRunner.query(`
      INSERT INTO nota_fiscal (chave, valor_total, cpf, status) VALUES
        ('00000000000000000000000000000000000000000001', 120.00, NULL, 'disponivel'),
        ('00000000000000000000000000000000000000000002', 250.00, '11111111111', 'disponivel'),
        ('00000000000000000000000000000000000000000003', 85.50, '33333333334', 'disponivel'),
        ('00000000000000000000000000000000000000000004', 50.00, '11111111111', 'processada')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS extrato_wallet`);
    await queryRunner.query(`DROP TABLE IF EXISTS nota_fiscal`);
    await queryRunner.query(`
      ALTER TABLE pedido_presente
        DROP COLUMN valor_pix,
        DROP COLUMN wallet_usado,
        MODIFY COLUMN status ENUM(
          'pendente', 'pago', 'enviado', 'a_caminho', 'entregue', 'cancelado'
        ) NOT NULL DEFAULT 'pendente'
    `);
    await queryRunner.query(`
      ALTER TABLE usuario
        DROP COLUMN kyc_status,
        DROP COLUMN saldo_wallet
    `);
  }
}
