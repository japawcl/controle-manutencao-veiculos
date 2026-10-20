import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { PecasRepository } from './pecas.repository';
import { Peca } from './peca.entity';
import { SalvarPecaDto } from './dto/salvar-peca.dto';

export type ResultadoCadastroPeca =
  | { ok: true; peca: Peca }
  | { ok: false; motivo: string };

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

  async cadastrar(dados: SalvarPecaDto): Promise<ResultadoCadastroPeca> {
    const nome = dados.nome.trim();
    const repetidas = await this.pecasRepository.countBy({ nome });

    if (repetidas > 0) {
      return { ok: false, motivo: 'Já existe uma peça com esse nome.' };
    }

    const peca = await this.pecasRepository.save(
      this.pecasRepository.create({ nome }),
    );

    return { ok: true, peca };
  }
}
