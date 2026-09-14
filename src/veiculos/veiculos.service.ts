import { Injectable } from '@nestjs/common';
import { Veiculo } from './veiculo.model';

@Injectable()
export class VeiculosService {
  private readonly veiculos: Veiculo[] = [
    {
      id: 1,
      apelido: 'Carro da família',
      marca: 'Fiat',
      modelo: 'Argo Drive 1.0',
      placa: 'QWA-3F42',
      ano: 2021,
      kmAtual: 68420,
    },
    {
      id: 2,
      apelido: 'Moto do trabalho',
      marca: 'Honda',
      modelo: 'CG 160 Titan',
      placa: 'PBX-7J18',
      ano: 2019,
      kmAtual: 41230,
    },
    {
      id: 3,
      apelido: 'Carro antigo',
      marca: 'Volkswagen',
      modelo: 'Gol G5 1.0',
      placa: 'MZT-9C07',
      ano: 2012,
      kmAtual: 187650,
    },
  ];

  listar(): Veiculo[] {
    return this.veiculos;
  }

  buscarPorId(id: number): Veiculo | undefined {
    return this.veiculos.find((veiculo) => veiculo.id === id);
  }

  atualizarKm(id: number, km: number): void {
    const veiculo = this.buscarPorId(id);
    if (veiculo && km > veiculo.kmAtual) {
      veiculo.kmAtual = km;
    }
  }
}
