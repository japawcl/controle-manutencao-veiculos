import { MigrationInterface, QueryRunner } from 'typeorm';

export class V3AdicionaRelacaoVeiculo1700000003000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE manutencoes
      ADD COLUMN id_veiculo BIGINT NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE manutencoes
      ADD CONSTRAINT fk_manutencoes_veiculo
      FOREIGN KEY (id_veiculo)
      REFERENCES veiculos (id)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE manutencoes DROP CONSTRAINT fk_manutencoes_veiculo
    `);
    await queryRunner.query(`ALTER TABLE manutencoes DROP COLUMN id_veiculo`);
  }
}
