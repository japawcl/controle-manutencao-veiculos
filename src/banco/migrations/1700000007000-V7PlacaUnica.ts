import { MigrationInterface, QueryRunner } from 'typeorm';

export class V7PlacaUnica1700000007000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    const duplicadas = await q.query(`SELECT UPPER(REPLACE(placa, '-', '')) AS placa
      FROM veiculos GROUP BY UPPER(REPLACE(placa, '-', '')) HAVING COUNT(*) > 1`);
    if (duplicadas.length) {
      throw new Error('Existem veículos com placas repetidas. Revise os cadastros antes de aplicar V7: ' + duplicadas.map((v: { placa: string }) => v.placa).join(', '));
    }
    await q.query(`CREATE UNIQUE INDEX uq_veiculos_placa_normalizada ON veiculos (UPPER(REPLACE(placa, '-', '')))`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP INDEX uq_veiculos_placa_normalizada');
  }
}
