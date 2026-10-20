import { MigrationInterface, QueryRunner } from 'typeorm';

export class V2CriaManutencoes1700000002000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE manutencoes (
        id BIGSERIAL PRIMARY KEY,
        tipo VARCHAR(100) NOT NULL,
        descricao TEXT,
        oficina VARCHAR(120),
        data DATE NOT NULL,
        km INTEGER NOT NULL,
        custo NUMERIC(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE manutencoes`);
  }
}
