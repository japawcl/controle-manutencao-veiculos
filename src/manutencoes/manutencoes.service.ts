import { Injectable } from '@nestjs/common';
import { ManutencoesRepository } from './manutencoes.repository';
import { Manutencao, StatusManutencao } from './manutencao.entity';
import { SalvarManutencaoDto } from './dto/salvar-manutencao.dto';
import { VeiculosService } from '../veiculos/veiculos.service';
import { PecasService } from '../pecas/pecas.service';

export type ResultadoOperacao =
  | { ok: true; manutencao: Manutencao }
  | { ok: false; motivo: string };

@Injectable()
export class ManutencoesService {
  constructor(
    private readonly manutencoesRepository: ManutencoesRepository,
    private readonly veiculosService: VeiculosService,
    private readonly pecasService: PecasService,
  ) {}

  listarTodas(): Promise<Manutencao[]> {
    return this.manutencoesRepository.find({
      relations: { veiculo: true, pecas: true },
      order: { data: 'DESC', id: 'DESC' },
    });
  }

  buscarPorId(id: number): Promise<Manutencao | null> {
    return this.manutencoesRepository.findOne({
      where: { id },
      relations: { veiculo: true, pecas: true },
    });
  }

  listarPorVeiculo(veiculoId: number): Promise<Manutencao[]> {
    return this.manutencoesRepository.find({
      where: { veiculo: { id: veiculoId } },
      relations: { veiculo: true },
    });
  }

  async gastoTotal(): Promise<number> {
    const linha = await this.manutencoesRepository
      .createQueryBuilder('manutencao')
      .select('COALESCE(SUM(manutencao.custo), 0)', 'total')
      .getRawOne<{ total: string }>();

    return Number(linha?.total ?? 0);
  }

  async gastoPorVeiculo(veiculoId: number): Promise<number> {
    const linha = await this.manutencoesRepository
      .createQueryBuilder('manutencao')
      .select('COALESCE(SUM(manutencao.custo), 0)', 'total')
      .where('manutencao.id_veiculo = :veiculoId', { veiculoId })
      .getRawOne<{ total: string }>();

    return Number(linha?.total ?? 0);
  }

  contarPorVeiculo(veiculoId: number): Promise<number> {
    return this.manutencoesRepository.countBy({ veiculo: { id: veiculoId } });
  }

  contarPorStatus(status: StatusManutencao): Promise<number> {
    return this.manutencoesRepository.countBy({ status });
  }

  contarTodas(): Promise<number> {
    return this.manutencoesRepository.count();
  }

  async cadastrar(
    dados: SalvarManutencaoDto,
    pecasIds: number[],
  ): Promise<ResultadoOperacao> {
    const veiculo = await this.veiculosService.buscarPorId(dados.veiculoId);

    if (!veiculo) {
      return { ok: false, motivo: 'Veículo não encontrado.' };
    }

    const manutencao = this.manutencoesRepository.create({
      tipo: dados.tipo,
      descricao: dados.descricao,
      oficina: dados.oficina,
      data: dados.data,
      km: dados.km,
      custo: dados.custo,
      status: 'Agendada',
      veiculo,
      pecas: await this.pecasService.buscarPorIds(pecasIds),
    });

    const salva = await this.manutencoesRepository.save(manutencao);
    await this.veiculosService.atualizarKm(veiculo.id, dados.km);

    return { ok: true, manutencao: salva };
  }

  async atualizar(
    id: number,
    dados: SalvarManutencaoDto,
    pecasIds: number[],
  ): Promise<ResultadoOperacao> {
    const manutencao = await this.buscarPorId(id);

    if (!manutencao) {
      return { ok: false, motivo: 'Manutenção não encontrada.' };
    }

    const veiculo = await this.veiculosService.buscarPorId(dados.veiculoId);

    if (!veiculo) {
      return { ok: false, motivo: 'Veículo não encontrado.' };
    }

    const novoStatus = dados.status ?? manutencao.status;

    if (!this.transicaoPermitida(manutencao.status, novoStatus)) {
      return {
        ok: false,
        motivo: 'Uma manutenção concluída não pode voltar para agendada.',
      };
    }

    manutencao.tipo = dados.tipo;
    manutencao.descricao = dados.descricao;
    manutencao.oficina = dados.oficina;
    manutencao.data = dados.data;
    manutencao.km = dados.km;
    manutencao.custo = dados.custo;
    manutencao.status = novoStatus;
    manutencao.veiculo = veiculo;
    manutencao.pecas = await this.pecasService.buscarPorIds(pecasIds);

    const salva = await this.manutencoesRepository.save(manutencao);
    await this.veiculosService.atualizarKm(veiculo.id, dados.km);

    return { ok: true, manutencao: salva };
  }

  async alterarStatus(
    id: number,
    novoStatus: StatusManutencao,
  ): Promise<ResultadoOperacao> {
    const manutencao = await this.buscarPorId(id);

    if (!manutencao) {
      return { ok: false, motivo: 'Manutenção não encontrada.' };
    }

    if (!this.transicaoPermitida(manutencao.status, novoStatus)) {
      return {
        ok: false,
        motivo: 'Uma manutenção concluída não pode voltar para agendada.',
      };
    }

    manutencao.status = novoStatus;
    const salva = await this.manutencoesRepository.save(manutencao);

    return { ok: true, manutencao: salva };
  }

  async excluir(id: number): Promise<boolean> {
    const manutencao = await this.buscarPorId(id);

    if (!manutencao) {
      return false;
    }

    manutencao.pecas = [];
    await this.manutencoesRepository.save(manutencao);
    await this.manutencoesRepository.delete(id);

    return true;
  }

  private transicaoPermitida(
    atual: StatusManutencao,
    novo: StatusManutencao,
  ): boolean {
    return !(atual === 'Concluída' && novo === 'Agendada');
  }
}
