import { MigrationInterface, QueryRunner } from 'typeorm';

export class V1CriaVeiculos1700000001000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE veiculos (
        id BIGSERIAL PRIMARY KEY,
        apelido VARCHAR(60) NOT NULL,
        marca VARCHAR(60) NOT NULL,
        modelo VARCHAR(60) NOT NULL,
        placa VARCHAR(10) NOT NULL,
        ano INTEGER NOT NULL,
        km_atual INTEGER NOT NULL DEFAULT 0
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE veiculos`);
  }
}
