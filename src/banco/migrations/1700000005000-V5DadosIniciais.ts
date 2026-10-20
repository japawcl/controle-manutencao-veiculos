import { MigrationInterface, QueryRunner } from 'typeorm';

export class V5DadosIniciais1700000005000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO veiculos (apelido, marca, modelo, placa, ano, km_atual) VALUES
        ('Carro da família', 'Fiat', 'Argo Drive 1.0', 'QWA-3F42', 2021, 68420),
        ('Moto do trabalho', 'Honda', 'CG 160 Titan', 'PBX-7J18', 2019, 41230),
        ('Carro antigo', 'Volkswagen', 'Gol G5 1.0', 'MZT-9C07', 2012, 187650)
    `);

    await queryRunner.query(`
      INSERT INTO pecas (nome) VALUES
        ('Óleo do motor'),
        ('Filtro de óleo'),
        ('Pastilha de freio'),
        ('Disco de freio'),
        ('Pneu'),
        ('Correia dentada'),
        ('Bateria'),
        ('Kit relação'),
        ('Vela de ignição'),
        ('Filtro de ar')
    `);

    await queryRunner.query(`
      INSERT INTO manutencoes (tipo, descricao, oficina, data, km, custo, status, id_veiculo) VALUES
        ('Troca de óleo', 'Óleo sintético 5W30 e filtro de óleo.', 'Auto Center Farol', '2026-07-18', 65200, 320.00, 'Concluída', 1),
        ('Alinhamento e balanceamento', 'Volante puxando para a direita.', 'Pneus Jatiúca', '2026-08-30', 67100, 180.00, 'Concluída', 1),
        ('Troca de relação', 'Kit completo: coroa, pinhão e corrente.', 'Moto Peça Benedito Bentes', '2026-09-05', 40800, 290.00, 'Em andamento', 2),
        ('Revisão de freios', 'Pastilhas dianteiras gastas e disco com sulco.', 'Oficina do Marcos', '2026-09-20', 188000, 540.00, 'Agendada', 3)
    `);

    await queryRunner.query(`
      INSERT INTO manutencao_pecas (id_manutencao, id_peca) VALUES
        (1, 1), (1, 2),
        (2, 5),
        (3, 8),
        (4, 3), (4, 4)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM manutencao_pecas`);
    await queryRunner.query(`DELETE FROM manutencoes`);
    await queryRunner.query(`DELETE FROM pecas`);
    await queryRunner.query(`DELETE FROM veiculos`);
  }
}
