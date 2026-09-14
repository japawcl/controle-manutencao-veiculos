import { Controller, Get, Render } from '@nestjs/common';
import { VeiculosService } from './veiculos.service';
import { ManutencoesService } from '../manutencoes/manutencoes.service';

@Controller('veiculos')
export class VeiculosController {
  constructor(
    private readonly veiculosService: VeiculosService,
    private readonly manutencoesService: ManutencoesService,
  ) {}

  @Get()
  @Render('veiculos/lista')
  lista() {
    const veiculos = this.veiculosService.listar().map((veiculo) => ({
      ...veiculo,
      totalManutencoes: this.manutencoesService.listarPorVeiculo(veiculo.id)
        .length,
      gastoTotal: this.manutencoesService.gastoPorVeiculo(veiculo.id),
    }));

    return { titulo: 'Veículos', pagina: 'veiculos', veiculos };
  }
}
