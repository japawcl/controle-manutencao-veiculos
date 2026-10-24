import {
  Body,
  Param,
  ParseIntPipe,
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

    const resultado = await this.veiculosService.cadastrar(dados);
    if (!resultado.ok) {
      return resposta.status(200).render('veiculos/novo', {
        titulo: 'Novo veículo', pagina: 'veiculos', veiculo: corpo,
        erros: { placa: resultado.motivo },
      });
    }
    definirMensagem(requisicao, 'sucesso', 'Veículo cadastrado com sucesso!');

    return resposta.redirect(302, '/veiculos');
  }

  @Get(':id')
  async detalhes(@Param('id', ParseIntPipe) id: number, @Req() requisicao: Request, @Res() resposta: Response) {
    const registro = await this.veiculosService.buscarPorId(id);
    if (!registro) {
      definirMensagem(requisicao, 'erro', 'Veículo não encontrado.');
      return resposta.redirect(302, '/veiculos');
    }
    return resposta.render('veiculos/detalhes', { titulo: 'Detalhes', pagina: 'veiculos', veiculo: registro, manutencoes: await this.manutencoesService.listarPorVeiculo(id), });
  }

  @Get(':id/editar')
  async editar(@Param('id', ParseIntPipe) id: number, @Req() requisicao: Request, @Res() resposta: Response) {
    const registro = await this.veiculosService.buscarPorId(id);
    if (!registro) {
      definirMensagem(requisicao, 'erro', 'Veículo não encontrado.');
      return resposta.redirect(302, '/veiculos');
    }
    return resposta.render('veiculos/editar', { titulo: 'Editar Veículo', pagina: 'veiculos', veiculo: registro, erros: {} });
  }

  @Post(':id/editar')
  async atualizar(@Param('id', ParseIntPipe) id: number, @Body() corpo: Record<string, unknown>, @Req() requisicao: Request, @Res() resposta: Response) {
    const { dados, erros, temErros } = await validarFormulario(SalvarVeiculoDto, corpo);
    const motivo = temErros ? null : await this.veiculosService.atualizar(id, dados);
    if (temErros || motivo) {
      return resposta.status(200).render('veiculos/editar', {
        titulo: 'Editar Veículo', pagina: 'veiculos', veiculo: { ...corpo, id }, erros, erro: motivo,
      });
    }
    definirMensagem(requisicao, 'sucesso', 'Veículo atualizado com sucesso!');
    return resposta.redirect(302, '/veiculos');
  }

  @Post(':id/excluir')
  async excluir(@Param('id', ParseIntPipe) id: number, @Req() requisicao: Request, @Res() resposta: Response) {
    const motivo = await this.veiculosService.excluir(id);
    definirMensagem(requisicao, motivo ? 'erro' : 'sucesso', motivo ?? 'Veículo excluído com sucesso!');
    return resposta.redirect(302, '/veiculos');
  }
}
