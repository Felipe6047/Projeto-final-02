import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductCategories1748266100000 implements MigrationInterface {
  name = "ProductCategories1748266100000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add the column with a default value to prevent errors on existing rows
    await queryRunner.query(`
      ALTER TABLE produto
        ADD COLUMN categoria VARCHAR(100) NOT NULL DEFAULT 'Outros' AFTER descricao
    `);

    // 2. Categorize existing products by name
    await queryRunner.query(`UPDATE produto SET categoria = 'Eletrônicos' WHERE nome LIKE '%Fone%' OR nome LIKE '%Smartwatch%' OR nome LIKE '%Teclado%' OR nome LIKE '%Mouse%'`);
    await queryRunner.query(`UPDATE produto SET categoria = 'Moda' WHERE nome LIKE '%Camiseta%' OR nome LIKE '%Tênis%' OR nome LIKE '%Óculos%'`);
    await queryRunner.query(`UPDATE produto SET categoria = 'Acessórios' WHERE nome LIKE '%Mochila%' OR nome LIKE '%Caneca%' OR nome LIKE '%Garrafa%'`);
    await queryRunner.query(`UPDATE produto SET categoria = 'Bem-estar' WHERE nome LIKE '%Spa%' OR nome LIKE '%Skincare%' OR nome LIKE '%Café%'`);
    await queryRunner.query(`UPDATE produto SET categoria = 'Casa' WHERE nome LIKE '%Luminária%'`);
    await queryRunner.query(`UPDATE produto SET categoria = 'Livros' WHERE nome LIKE '%Livro%'`);
    await queryRunner.query(`UPDATE produto SET categoria = 'Viagens' WHERE nome LIKE '%Nécessaire%'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE produto
        DROP COLUMN categoria
    `);
  }
}
