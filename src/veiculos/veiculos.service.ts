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

  buscarPorId(id: number): Promise<Veiculo | null> {
    return this.veiculosRepository.findOneBy({ id });
  }

  async cadastrar(dados: SalvarVeiculoDto): Promise<Veiculo> {
    const veiculo = this.veiculosRepository.create({
      ...dados,
      placa: dados.placa.toUpperCase(),
    });

    return this.veiculosRepository.save(veiculo);
  }

  async atualizarKm(id: number, km: number): Promise<void> {
    const veiculo = await this.buscarPorId(id);

    if (veiculo && km > veiculo.kmAtual) {
      veiculo.kmAtual = km;
      await this.veiculosRepository.save(veiculo);
    }
  }
}
