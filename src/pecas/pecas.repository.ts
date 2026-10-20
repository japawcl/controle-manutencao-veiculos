import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Peca } from './peca.entity';

@Injectable()
export class PecasRepository extends Repository<Peca> {
  constructor(dataSource: DataSource) {
    super(Peca, dataSource.createEntityManager());
  }
}
