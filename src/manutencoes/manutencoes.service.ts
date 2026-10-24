import { hojeNoBrasil } from '../comum/datas';
import { Injectable } from '@nestjs/common';
import { ManutencoesRepository } from './manutencoes.repository';
import { Manutencao, StatusManutencao, STATUS_POSSIVEIS } from './manutencao.entity';
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

  buscarPorId(id: string | number): Promise<Manutencao | null> {
    return this.manutencoesRepository.findOne({
      where: { id: String(id) },
      relations: { veiculo: true, pecas: true },
    });
  }

  listarPorVeiculo(veiculoId: string | number): Promise<Manutencao[]> {
    return this.manutencoesRepository.find({
      where: { veiculo: { id: String(veiculoId) } },
      relations: { veiculo: true },
    });
  }

  gastoTotal(): Promise<number> {
    return this.manutencoesRepository.somarCustos();
  }

  gastoPorVeiculo(veiculoId: string | number): Promise<number> {
    return this.manutencoesRepository.somarCustosPorVeiculo(veiculoId);
  }

  contarPorVeiculo(veiculoId: string | number): Promise<number> {
    return this.manutencoesRepository.countBy({ veiculo: { id: String(veiculoId) } });
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
    const status: StatusManutencao = dados.registro === 'historico' ? 'Concluída' : 'Agendada';
    const motivoData = this.validarData(dados.data, status);
    if (motivoData) return { ok: false, motivo: motivoData };

    const veiculo = await this.veiculosService.buscarPorId(dados.veiculoId);

    if (!veiculo) {
      return { ok: false, motivo: 'Veículo não encontrado.' };
    }

    const pecas = await this.pecasService.buscarPorIds(pecasIds);
    if (!pecas) return { ok: false, motivo: 'Selecione apenas peças existentes e válidas.' };

    const manutencao = this.manutencoesRepository.create({
      tipo: dados.tipo,
      descricao: dados.descricao,
      oficina: dados.oficina,
      data: dados.data,
      km: dados.km,
      custo: dados.custo,
      status,
      veiculo,
      pecas,
    });

    const salva = await this.manutencoesRepository.salvarComOdometro(manutencao, status === 'Concluída');

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
        motivo: 'Não é permitido voltar o status. Uma manutenção concluída não pode ser reaberta.',
      };
    }

    const motivoData = this.validarData(dados.data, novoStatus, manutencao);
    if (motivoData) return { ok: false, motivo: motivoData };

    const pecas = await this.pecasService.buscarPorIds(pecasIds);
    if (!pecas) return { ok: false, motivo: 'Selecione apenas peças existentes e válidas.' };

    manutencao.tipo = dados.tipo;
    manutencao.descricao = dados.descricao;
    manutencao.oficina = dados.oficina;
    manutencao.data = dados.data;
    manutencao.km = dados.km;
    manutencao.custo = dados.custo;
    manutencao.status = novoStatus;
    manutencao.veiculo = veiculo;
    manutencao.pecas = pecas;

    const salva = await this.manutencoesRepository.salvarComOdometro(manutencao, novoStatus === 'Concluída');

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
        motivo: 'Não é permitido voltar o status. Uma manutenção concluída não pode ser reaberta.',
      };
    }

    const motivoData = this.validarData(manutencao.data, novoStatus, manutencao);
    if (motivoData) return { ok: false, motivo: motivoData };

    manutencao.status = novoStatus;
    const salva = await this.manutencoesRepository.salvarComOdometro(manutencao, novoStatus === 'Concluída');

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

  private validarData(data: string, status: StatusManutencao, original?: Manutencao): string | null {
    const hoje = hojeNoBrasil();
    if (status === 'Agendada' && data < hoje) {
      // Um agendamento que venceu pode continuar no histórico e receber correções.
      const vencidaInalterada = original?.status === 'Agendada' && original.data === data;
      if (!vencidaInalterada) return 'Um novo agendamento não pode ter data passada. Para um serviço realizado, escolha registrar no histórico.';
    }
    if (status !== 'Agendada' && data > hoje) {
      return 'Uma manutenção em andamento ou concluída não pode ter data futura. Corrija a data antes de alterar o status.';
    }
    return null;
  }

  private transicaoPermitida(atual: StatusManutencao, novo: StatusManutencao): boolean {
    const transicoes: Record<StatusManutencao, StatusManutencao[]> = {
      'Agendada': ['Agendada', 'Em andamento', 'Concluída'],
      'Em andamento': ['Em andamento', 'Concluída'],
      'Concluída': ['Concluída'],
    };
    return STATUS_POSSIVEIS.includes(novo) && (transicoes[atual]?.includes(novo) ?? false);
  }
}
