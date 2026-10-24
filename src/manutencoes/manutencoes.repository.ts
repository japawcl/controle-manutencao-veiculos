import { Veiculo } from '../veiculos/veiculo.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Manutencao } from './manutencao.entity';

@Injectable()
export class ManutencoesRepository extends Repository<Manutencao> {
  constructor(dataSource: DataSource) {
    super(Manutencao, dataSource.createEntityManager());
  }

  async salvarComOdometro(manutencao: Manutencao, atualizarOdometro: boolean): Promise<Manutencao> {
    return this.manager.transaction(async manager => {
      const salva = await manager.getRepository(Manutencao).save(manutencao);
      if (atualizarOdometro) {
        // Comparação atômica evita uma leitura menor sobrescrever uma maior.
        await manager.getRepository(Veiculo).createQueryBuilder()
          .update(Veiculo)
          .set({ kmAtual: () => 'CASE WHEN km_atual < :km THEN :km ELSE km_atual END' })
          .where('id = :id', { id: salva.veiculo.id })
          .setParameter('km', salva.km)
          .execute();
      }
      return salva;
    });
  }

  async somarCustos(): Promise<number> {
    const linha = await this.createQueryBuilder('manutencao')
      .select('COALESCE(SUM(manutencao.custo), 0)', 'total')
      .getRawOne<{ total: string }>();

    return Number(linha?.total ?? 0);
  }

  async somarCustosPorVeiculo(veiculoId: string | number): Promise<number> {
    const linha = await this.createQueryBuilder('manutencao')
      .select('COALESCE(SUM(manutencao.custo), 0)', 'total')
      .where('manutencao.id_veiculo = :veiculoId', { veiculoId })
      .getRawOne<{ total: string }>();

    return Number(linha?.total ?? 0);
  }
}
