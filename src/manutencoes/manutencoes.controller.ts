import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Redirect,
  Render,
} from '@nestjs/common';
import { ManutencoesService } from './manutencoes.service';
import { VeiculosService } from '../veiculos/veiculos.service';
import { CriarManutencaoDto } from './manutencao.model';

@Controller('manutencoes')
export class ManutencoesController {
  constructor(
    private readonly manutencoesService: ManutencoesService,
    private readonly veiculosService: VeiculosService,
  ) {}

  @Get()
  @Render('manutencoes/lista')
  lista() {
    const manutencoes = this.manutencoesService.listar().map((manutencao) => ({
      ...manutencao,
      veiculo: this.veiculosService.buscarPorId(manutencao.veiculoId),
    }));

    return { titulo: 'Manutenções', pagina: 'manutencoes', manutencoes };
  }

  @Get('nova')
  @Render('manutencoes/nova')
  nova() {
    return {
      titulo: 'Nova manutenção',
      pagina: 'manutencoes',
      veiculos: this.veiculosService.listar(),
    };
  }

  @Post()
  @Redirect('/manutencoes', 302)
  criar(@Body() dto: CriarManutencaoDto) {
    const manutencao = this.manutencoesService.criar(dto);
    this.veiculosService.atualizarKm(manutencao.veiculoId, manutencao.km);
  }

  @Get(':id')
  @Render('manutencoes/detalhes')
  detalhes(@Param('id') id: string) {
    const manutencao = this.manutencoesService.buscarPorId(Number(id));

    if (!manutencao) {
      throw new NotFoundException('Manutenção não encontrada');
    }

    return {
      titulo: manutencao.tipo,
      pagina: 'manutencoes',
      manutencao,
      veiculo: this.veiculosService.buscarPorId(manutencao.veiculoId),
    };
  }
}
