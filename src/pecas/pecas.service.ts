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

  async buscarPorIds(ids: number[]): Promise<Peca[] | null> {
    if (ids.some(id => !Number.isSafeInteger(id) || id < 1)) return null;
    ids = [...new Set(ids)];
    if (ids.length === 0) {
      return Promise.resolve([]);
    }

    const pecas = await this.pecasRepository.find({ where: { id: In(ids.map(String)) } });
    return pecas.length === ids.length ? pecas : null;
  }

  buscarPorId(id: number): Promise<Peca | null> {
    return this.pecasRepository.findOneBy({ id: String(id) });
  }

  async atualizar(id: number, dados: SalvarPecaDto): Promise<string | null> {
    const peca = await this.buscarPorId(id);
    if (!peca) return 'Peça não encontrada.';
    peca.nome = dados.nome;
    try {
      await this.pecasRepository.save(peca);
      return null;
    } catch (erro) {
      if ((erro as { driverError?: { code?: string } }).driverError?.code === '23505') return 'Já existe uma peça com esse nome.';
      throw erro;
    }
  }

  async excluir(id: number): Promise<string | null> {
    try {
      const resultado = await this.pecasRepository.delete(String(id));
      return resultado.affected ? null : 'Peça não encontrada.';
    } catch (erro) {
      if ((erro as { driverError?: { code?: string } }).driverError?.code === '23503') return 'Não é possível excluir uma peça utilizada em manutenções.';
      throw erro;
    }
  }

  async cadastrar(dados: SalvarPecaDto): Promise<ResultadoCadastroPeca> {
    const nome = dados.nome.trim();
    const repetidas = await this.pecasRepository.countBy({ nome });

    if (repetidas > 0) {
      return { ok: false, motivo: 'Já existe uma peça com esse nome.' };
    }

    let peca: Peca;
    try {
      peca = await this.pecasRepository.save(this.pecasRepository.create({ nome }));
    } catch (erro) {
      if ((erro as { driverError?: { code?: string } }).driverError?.code === '23505') {
        return { ok: false, motivo: 'Já existe uma peça com esse nome.' };
      }
      throw erro;
    }

    return { ok: true, peca };
  }
}
