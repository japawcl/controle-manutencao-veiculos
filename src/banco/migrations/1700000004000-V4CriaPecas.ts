import { MigrationInterface, QueryRunner } from 'typeorm';

export class V4CriaPecas1700000004000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE pecas (
        id BIGSERIAL PRIMARY KEY,
        nome VARCHAR(80) NOT NULL UNIQUE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE manutencao_pecas (
        id_manutencao BIGINT NOT NULL,
        id_peca BIGINT NOT NULL,

        PRIMARY KEY (id_manutencao, id_peca),

        CONSTRAINT fk_manutencao_pecas_manutencao
          FOREIGN KEY (id_manutencao)
          REFERENCES manutencoes (id)
          ON DELETE CASCADE,

        CONSTRAINT fk_manutencao_pecas_peca
          FOREIGN KEY (id_peca)
          REFERENCES pecas (id)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE manutencao_pecas`);
    await queryRunner.query(`DROP TABLE pecas`);
  }
}
