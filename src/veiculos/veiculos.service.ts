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

  async cadastrar(dados: SalvarVeiculoDto): Promise<Veiculo> {
    const veiculo = this.veiculosRepository.create({
      ...dados,
      placa: dados.placa.toUpperCase(),
    });

    return this.veiculosRepository.save(veiculo);
  }

  async atualizar(id: number, dados: SalvarVeiculoDto): Promise<string | null> {
    const veiculo = await this.buscarPorId(id);
    if (!veiculo) return 'Veículo não encontrado.';
    if (dados.kmAtual < veiculo.kmAtual) return 'O odômetro não pode retroceder.';
    Object.assign(veiculo, dados, { placa: dados.placa.toUpperCase() });
    await this.veiculosRepository.save(veiculo);
    return null;
  }

  async excluir(id: number): Promise<string | null> {
    try {
      const resultado = await this.veiculosRepository.delete(String(id));
      return resultado.affected ? null : 'Veículo não encontrado.';
    } catch (erro) {
      if ((erro as { driverError?: { code?: string } }).driverError?.code === '23503') {
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
