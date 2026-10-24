import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Veiculo } from './veiculo.entity';

@Injectable()
export class VeiculosRepository extends Repository<Veiculo> {
  constructor(dataSource: DataSource) {
    super(Veiculo, dataSource.createEntityManager());
  }
  buscarPorPlaca(placa: string): Promise<Veiculo | null> {
    return this.createQueryBuilder('veiculo')
      .where("UPPER(REPLACE(veiculo.placa, '-', '')) = :placa", { placa })
      .getOne();
  }
}
