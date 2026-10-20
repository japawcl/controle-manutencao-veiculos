import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Manutencao } from './manutencao.entity';

@Injectable()
export class ManutencoesRepository extends Repository<Manutencao> {
  constructor(dataSource: DataSource) {
    super(Manutencao, dataSource.createEntityManager());
  }
}
