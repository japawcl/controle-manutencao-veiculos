import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { PecasRepository } from './pecas.repository';
import { Peca } from './peca.entity';
import { SalvarPecaDto } from './dto/salvar-peca.dto';

@Injectable()
export class PecasService {
  constructor(private readonly pecasRepository: PecasRepository) {}

  listarTodas(): Promise<Peca[]> {
    return this.pecasRepository.find({ order: { nome: 'ASC' } });
  }

  buscarPorIds(ids: number[]): Promise<Peca[]> {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }

    return this.pecasRepository.find({ where: { id: In(ids) } });
  }

  async existeComNome(nome: string): Promise<boolean> {
    const quantidade = await this.pecasRepository.countBy({ nome });
    return quantidade > 0;
  }

  async cadastrar(dados: SalvarPecaDto): Promise<Peca> {
    const peca = this.pecasRepository.create({ nome: dados.nome.trim() });
    return this.pecasRepository.save(peca);
  }
}
