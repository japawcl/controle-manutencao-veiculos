import { MigrationInterface, QueryRunner } from 'typeorm';
import { V5DadosIniciais1700000005000 } from '../migrations/1700000005000-V5DadosIniciais';

// Schema SQLite próprio: não executar SQL PostgreSQL neste arquivo local.
export class V1Demo1700000010000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE veiculos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apelido VARCHAR(60) NOT NULL, marca VARCHAR(60) NOT NULL,
      modelo VARCHAR(60) NOT NULL, placa VARCHAR(10) NOT NULL,
      ano INTEGER NOT NULL CHECK (ano BETWEEN 1950 AND 2100),
      km_atual INTEGER NOT NULL DEFAULT 0 CHECK (km_atual >= 0)
    )`);
    await q.query(`CREATE TABLE pecas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(80) NOT NULL UNIQUE CHECK (length(trim(nome)) BETWEEN 2 AND 80)
    )`);
    await q.query(`CREATE TABLE manutencoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo VARCHAR(100) NOT NULL CHECK (length(trim(tipo)) BETWEEN 3 AND 100),
      descricao TEXT, oficina VARCHAR(120), data DATE NOT NULL,
      km INTEGER NOT NULL CHECK (km >= 0), custo NUMERIC(10,2) NOT NULL CHECK (custo >= 0),
      status VARCHAR(20) NOT NULL CHECK (status IN ('Agendada', 'Em andamento', 'Concluída')),
      id_veiculo INTEGER NOT NULL REFERENCES veiculos(id)
    )`);
    await q.query(`CREATE TABLE manutencao_pecas (
      id_manutencao INTEGER NOT NULL REFERENCES manutencoes(id) ON DELETE CASCADE,
      id_peca INTEGER NOT NULL REFERENCES pecas(id),
      PRIMARY KEY (id_manutencao, id_peca)
    )`);
    await new V5DadosIniciais1700000005000().up(q);
    await q.query(`UPDATE veiculos SET km_atual = MAX(km_atual,
      COALESCE((SELECT MAX(km) FROM manutencoes WHERE id_veiculo = veiculos.id), km_atual))`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE manutencao_pecas');
    await q.query('DROP TABLE manutencoes');
    await q.query('DROP TABLE pecas');
    await q.query('DROP TABLE veiculos');
  }
}
