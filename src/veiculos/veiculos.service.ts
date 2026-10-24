import { normalizarPlaca } from '../comum/transformacoes';
import { violacaoDeVinculo, violacaoDeUnicidade } from '../comum/erros-banco';
import { Injectable } from '@nestjs/common';
import { VeiculosRepository } from './veiculos.repository';
import { Veiculo } from './veiculo.entity';
import { SalvarVeiculoDto } from './dto/salvar-veiculo.dto';

@Injectable()
export class VeiculosService {
  constructor(private readonly veiculosRepository: VeiculosRepository) {}

  listarTodos(): Promise<Veiculo[]> {
    return this.veiculosRepository.find({ order: { apelido: 'ASC' } });
  }

  buscarPorId(id: string | number): Promise<Veiculo | null> {
    return this.veiculosRepository.findOneBy({ id: String(id) });
  }

  async cadastrar(dados: SalvarVeiculoDto): Promise<{ ok: true; veiculo: Veiculo } | { ok: false; motivo: string }> {
    const placa = normalizarPlaca(dados.placa);
    if (await this.veiculosRepository.buscarPorPlaca(placa)) {
      return { ok: false, motivo: 'Já existe um veículo com essa placa.' };
    }
    try {
      const veiculo = await this.veiculosRepository.save(this.veiculosRepository.create({ ...dados, placa }));
      return { ok: true, veiculo };
    } catch (erro) {
      if (violacaoDeUnicidade(erro)) return { ok: false, motivo: 'Já existe um veículo com essa placa.' };
      throw erro;
    }
  }

  async atualizar(id: number, dados: SalvarVeiculoDto): Promise<string | null> {
    const veiculo = await this.buscarPorId(id);
    if (!veiculo) return 'Veículo não encontrado.';
    if (dados.kmAtual < veiculo.kmAtual) return 'O odômetro não pode retroceder.';
    const placa = normalizarPlaca(dados.placa);
    const repetido = await this.veiculosRepository.buscarPorPlaca(placa);
    if (repetido && String(repetido.id) !== String(id)) return 'Já existe um veículo com essa placa.';
    Object.assign(veiculo, dados, { placa });
    try {
      await this.veiculosRepository.save(veiculo);
    } catch (erro) {
      if (violacaoDeUnicidade(erro)) return 'Já existe um veículo com essa placa.';
      throw erro;
    }
    return null;
  }

  async excluir(id: number): Promise<string | null> {
    try {
      const resultado = await this.veiculosRepository.delete(String(id));
      return resultado.affected ? null : 'Veículo não encontrado.';
    } catch (erro) {
      if (violacaoDeVinculo(erro)) {
        return 'Não é possível excluir um veículo com manutenções vinculadas.';
      }
      throw erro;
    }
  }

  async atualizarKm(id: string | number, km: number): Promise<void> {
    const veiculo = await this.buscarPorId(id);

    if (veiculo && km > veiculo.kmAtual) {
      veiculo.kmAtual = km;
      await this.veiculosRepository.save(veiculo);
    }
  }
}
