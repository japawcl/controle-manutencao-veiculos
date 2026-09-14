import { Controller, Get, Render } from '@nestjs/common';
import { ManutencoesService } from './manutencoes/manutencoes.service';
import { VeiculosService } from './veiculos/veiculos.service';

@Controller()
export class DashboardController {
  constructor(
    private readonly manutencoesService: ManutencoesService,
    private readonly veiculosService: VeiculosService,
  ) {}

  @Get()
  @Render('index')
  index() {
    const manutencoes = this.manutencoesService.listar();

    return {
      titulo: 'Painel',
      pagina: 'painel',
      totalVeiculos: this.veiculosService.listar().length,
      totalManutencoes: manutencoes.length,
      gastoTotal: this.manutencoesService.gastoTotal(),
      agendadas: this.manutencoesService.contarPorStatus('Agendada'),
      ultimas: manutencoes.slice(0, 3).map((manutencao) => ({
        ...manutencao,
        veiculo: this.veiculosService.buscarPorId(manutencao.veiculoId),
      })),
      veiculos: this.veiculosService.listar(),
    };
  }
}
