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
  async index() {
    const manutencoes = await this.manutencoesService.listarTodas();
    const veiculos = await this.veiculosService.listarTodos();

    return {
      titulo: 'Painel',
      pagina: 'painel',
      totalVeiculos: veiculos.length,
      totalManutencoes: await this.manutencoesService.contarTodas(),
      gastoTotal: await this.manutencoesService.gastoTotal(),
      agendadas: await this.manutencoesService.contarPorStatus('Agendada'),
      ultimas: manutencoes.slice(0, 3),
      veiculos,
    };
  }
}
