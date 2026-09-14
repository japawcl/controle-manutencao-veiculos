import { Injectable } from '@nestjs/common';
import { CriarManutencaoDto, Manutencao } from './manutencao.model';

@Injectable()
export class ManutencoesService {
  private readonly manutencoes: Manutencao[] = [
    {
      id: 1,
      veiculoId: 1,
      tipo: 'Troca de óleo',
      descricao: 'Óleo sintético 5W30 e filtro de óleo.',
      oficina: 'Auto Center Farol',
      data: '2026-07-18',
      km: 65200,
      custo: 320,
      status: 'Concluída',
    },
    {
      id: 2,
      veiculoId: 1,
      tipo: 'Alinhamento e balanceamento',
      descricao: 'Volante puxando para a direita.',
      oficina: 'Pneus Jatiuca',
      data: '2026-08-30',
      km: 67100,
      custo: 180,
      status: 'Concluída',
    },
    {
      id: 3,
      veiculoId: 2,
      tipo: 'Troca de relação',
      descricao: 'Kit completo: coroa, pinhão e corrente.',
      oficina: 'Moto Peça Benedito Bentes',
      data: '2026-09-05',
      km: 40800,
      custo: 290,
      status: 'Em andamento',
    },
    {
      id: 4,
      veiculoId: 3,
      tipo: 'Revisão de freios',
      descricao: 'Pastilhas dianteiras gastas e disco com sulco.',
      oficina: 'Oficina do Marcos',
      data: '2026-09-20',
      km: 188000,
      custo: 540,
      status: 'Agendada',
    },
  ];

  private proximoId = 5;

  listar(): Manutencao[] {
    return [...this.manutencoes].sort((a, b) => b.data.localeCompare(a.data));
  }

  buscarPorId(id: number): Manutencao | undefined {
    return this.manutencoes.find((manutencao) => manutencao.id === id);
  }

  listarPorVeiculo(veiculoId: number): Manutencao[] {
    return this.manutencoes.filter(
      (manutencao) => manutencao.veiculoId === veiculoId,
    );
  }

  gastoPorVeiculo(veiculoId: number): number {
    return this.listarPorVeiculo(veiculoId).reduce(
      (total, manutencao) => total + manutencao.custo,
      0,
    );
  }

  gastoTotal(): number {
    return this.manutencoes.reduce(
      (total, manutencao) => total + manutencao.custo,
      0,
    );
  }

  contarPorStatus(status: string): number {
    return this.manutencoes.filter(
      (manutencao) => manutencao.status === status,
    ).length;
  }

  criar(dto: CriarManutencaoDto): Manutencao {
    const manutencao: Manutencao = {
      id: this.proximoId++,
      veiculoId: Number(dto.veiculoId),
      tipo: dto.tipo,
      descricao: dto.descricao,
      oficina: dto.oficina,
      data: dto.data,
      km: Number(dto.km),
      custo: Number(dto.custo),
      status: dto.status ?? 'Agendada',
    };

    this.manutencoes.push(manutencao);
    return manutencao;
  }
}
