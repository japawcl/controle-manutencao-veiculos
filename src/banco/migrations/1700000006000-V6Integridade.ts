import { MigrationInterface, QueryRunner } from 'typeorm';

export class V6Integridade1700000006000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    // Dados legados inválidos devem ser corrigidos antes de aplicar esta migration.
    await q.query(`ALTER TABLE manutencoes ADD CONSTRAINT ck_manutencao_status CHECK (status IN ('Agendada', 'Em andamento', 'Concluída'))`);
    await q.query(`ALTER TABLE manutencoes ADD CONSTRAINT ck_manutencao_valores CHECK (km >= 0 AND custo >= 0 AND length(trim(tipo)) >= 3)`);
    await q.query(`ALTER TABLE pecas ADD CONSTRAINT ck_peca_nome CHECK (length(trim(nome)) BETWEEN 2 AND 80)`);
    await q.query(`ALTER TABLE veiculos ADD CONSTRAINT ck_veiculo_valores CHECK (km_atual >= 0 AND ano BETWEEN 1950 AND 2100)`);
    await q.query(`UPDATE veiculos v SET km_atual = GREATEST(v.km_atual, m.km) FROM (SELECT id_veiculo, MAX(km) AS km FROM manutencoes GROUP BY id_veiculo) m WHERE v.id = m.id_veiculo`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE veiculos DROP CONSTRAINT ck_veiculo_valores`);
    await q.query(`ALTER TABLE pecas DROP CONSTRAINT ck_peca_nome`);
    await q.query(`ALTER TABLE manutencoes DROP CONSTRAINT ck_manutencao_valores`);
    await q.query(`ALTER TABLE manutencoes DROP CONSTRAINT ck_manutencao_status`);
  }
}
