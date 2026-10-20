import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { VeiculosService } from './veiculos.service';
import { ManutencoesService } from '../manutencoes/manutencoes.service';
import { SalvarVeiculoDto } from './dto/salvar-veiculo.dto';
import { validarFormulario } from '../comum/validacao';
import { definirMensagem } from '../comum/mensagens';

@Controller('veiculos')
export class VeiculosController {
  constructor(
    private readonly veiculosService: VeiculosService,
    private readonly manutencoesService: ManutencoesService,
  ) {}

  @Get()
  @Render('veiculos/lista')
  async lista() {
    const veiculos = await this.veiculosService.listarTodos();

    const comTotais = await Promise.all(
      veiculos.map(async (veiculo) => ({
        ...veiculo,
        totalManutencoes: await this.manutencoesService.contarPorVeiculo(
          veiculo.id,
        ),
        gastoTotal: await this.manutencoesService.gastoPorVeiculo(veiculo.id),
      })),
    );

    return { titulo: 'Veículos', pagina: 'veiculos', veiculos: comTotais };
  }

  @Get('novo')
  @Render('veiculos/novo')
  novo() {
    return {
      titulo: 'Novo veículo',
      pagina: 'veiculos',
      veiculo: {},
      erros: {},
    };
  }

  @Post()
  async criar(
    @Body() corpo: Record<string, unknown>,
    @Req() requisicao: Request,
    @Res() resposta: Response,
  ) {
    const { dados, erros, temErros } = await validarFormulario(
      SalvarVeiculoDto,
      corpo,
    );

    if (temErros) {
      return resposta.status(200).render('veiculos/novo', {
        titulo: 'Novo veículo',
        pagina: 'veiculos',
        veiculo: corpo,
        erros,
      });
    }

    await this.veiculosService.cadastrar(dados);
    definirMensagem(requisicao, 'sucesso', 'Veículo cadastrado com sucesso!');

    return resposta.redirect(302, '/veiculos');
  }
}
