import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Manutencao } from './manutencao.entity';

@Injectable()
export class ManutencoesRepository extends Repository<Manutencao> {
  constructor(dataSource: DataSource) {
    super(Manutencao, dataSource.createEntityManager());
  }

  async somarCustos(): Promise<number> {
    const linha = await this.createQueryBuilder('manutencao')
      .select('COALESCE(SUM(manutencao.custo), 0)', 'total')
      .getRawOne<{ total: string }>();

    return Number(linha?.total ?? 0);
  }

  async somarCustosPorVeiculo(veiculoId: number): Promise<number> {
    const linha = await this.createQueryBuilder('manutencao')
      .select('COALESCE(SUM(manutencao.custo), 0)', 'total')
      .where('manutencao.id_veiculo = :veiculoId', { veiculoId })
      .getRawOne<{ total: string }>();

    return Number(linha?.total ?? 0);
  }
}
