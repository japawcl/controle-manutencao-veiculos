import { AlterarStatusDto } from './dto/alterar-status.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Redirect,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ManutencoesService } from './manutencoes.service';
import { VeiculosService } from '../veiculos/veiculos.service';
import { PecasService } from '../pecas/pecas.service';
import { SalvarManutencaoDto } from './dto/salvar-manutencao.dto';
import { STATUS_POSSIVEIS, StatusManutencao } from './manutencao.entity';
import { comoLista, validarFormulario } from '../comum/validacao';
import { definirMensagem } from '../comum/mensagens';

@Controller('manutencoes')
export class ManutencoesController {
  constructor(
    private readonly manutencoesService: ManutencoesService,
    private readonly veiculosService: VeiculosService,
    private readonly pecasService: PecasService,
  ) {}

  @Get()
  @Render('manutencoes/lista')
  async lista() {
    return {
      titulo: 'Manutenções',
      pagina: 'manutencoes',
      manutencoes: await this.manutencoesService.listarTodas(),
    };
  }

  @Get('nova')
  @Render('manutencoes/nova')
  async nova() {
    return {
      titulo: 'Nova manutenção',
      pagina: 'manutencoes',
      veiculos: await this.veiculosService.listarTodos(),
      pecas: await this.pecasService.listarTodas(),
      manutencao: {},
      pecasSelecionadas: [],
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
      SalvarManutencaoDto,
      corpo,
    );
    const pecasSelecionadas = comoLista(corpo.pecas);

    if (temErros) {
      return resposta.status(200).render('manutencoes/nova', {
        titulo: 'Nova manutenção',
        pagina: 'manutencoes',
        veiculos: await this.veiculosService.listarTodos(),
        pecas: await this.pecasService.listarTodas(),
        manutencao: corpo,
        pecasSelecionadas,
        erros,
      });
    }

    const resultado = await this.manutencoesService.cadastrar(
      dados,
      pecasSelecionadas.map(Number),
    );

    if (!resultado.ok) {
      return resposta.status(200).render('manutencoes/nova', {
        titulo: 'Manutenção', pagina: 'manutencoes',
        veiculos: await this.veiculosService.listarTodos(),
        pecas: await this.pecasService.listarTodas(),
        statusPossiveis: STATUS_POSSIVEIS,
        manutencao: corpo, pecasSelecionadas, erros: {}, erro: resultado.motivo,
      });
    }

    definirMensagem(requisicao, 'sucesso', 'Manutenção cadastrada com sucesso!');
    return resposta.redirect(302, '/manutencoes');
  }

  @Get(':id/editar')
  async editar(
    @Param('id', ParseIntPipe) id: number,
    @Req() requisicao: Request,
    @Res() resposta: Response,
  ) {
    const manutencao = await this.manutencoesService.buscarPorId(id);

    if (!manutencao) {
      definirMensagem(requisicao, 'erro', 'Manutenção não encontrada.');
      return resposta.redirect(302, '/manutencoes');
    }

    return resposta.render('manutencoes/editar', {
      titulo: 'Editar manutenção',
      pagina: 'manutencoes',
      veiculos: await this.veiculosService.listarTodos(),
      pecas: await this.pecasService.listarTodas(),
      statusPossiveis: STATUS_POSSIVEIS,
      manutencao: { ...manutencao, veiculoId: manutencao.veiculo.id },
      pecasSelecionadas: manutencao.pecas.map((peca) => String(peca.id)),
      erros: {},
    });
  }

  @Post(':id/editar')
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() corpo: Record<string, unknown>,
    @Req() requisicao: Request,
    @Res() resposta: Response,
  ) {
    const { dados, erros, temErros } = await validarFormulario(
      SalvarManutencaoDto,
      corpo,
    );
    const pecasSelecionadas = comoLista(corpo.pecas);

    if (temErros) {
      return resposta.status(200).render('manutencoes/editar', {
        titulo: 'Editar manutenção',
        pagina: 'manutencoes',
        veiculos: await this.veiculosService.listarTodos(),
        pecas: await this.pecasService.listarTodas(),
        statusPossiveis: STATUS_POSSIVEIS,
        manutencao: { ...corpo, id },
        pecasSelecionadas,
        erros,
      });
    }

    const resultado = await this.manutencoesService.atualizar(
      id,
      dados,
      pecasSelecionadas.map(Number),
    );

    if (!resultado.ok) {
      return resposta.status(200).render('manutencoes/editar', {
        titulo: 'Manutenção', pagina: 'manutencoes',
        veiculos: await this.veiculosService.listarTodos(),
        pecas: await this.pecasService.listarTodas(),
        statusPossiveis: STATUS_POSSIVEIS,
        manutencao: { ...corpo, id }, pecasSelecionadas, erros: {}, erro: resultado.motivo,
      });
    }

    definirMensagem(requisicao, 'sucesso', 'Manutenção atualizada com sucesso!');
    return resposta.redirect(302, '/manutencoes');
  }

  @Post(':id/status')
  async alterarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() corpo: Record<string, unknown>,
    @Req() requisicao: Request,
    @Res() resposta: Response,
  ) {
    const { dados, erros, temErros } = await validarFormulario(AlterarStatusDto, corpo);
    if (temErros) {
      definirMensagem(requisicao, 'erro', erros.status);
      return resposta.redirect(302, `/manutencoes/${id}`);
    }
    const status = dados.status;
    const resultado = await this.manutencoesService.alterarStatus(id, status);

    if (!resultado.ok) {
      definirMensagem(requisicao, 'erro', resultado.motivo);
      return resposta.redirect(302, '/manutencoes');
    }

    definirMensagem(requisicao, 'sucesso', `Status alterado para ${status}.`);
    return resposta.redirect(302, `/manutencoes/${id}`);
  }

  @Post(':id/excluir')
  async excluir(
    @Param('id', ParseIntPipe) id: number,
    @Req() requisicao: Request,
    @Res() resposta: Response,
  ) {
    const excluida = await this.manutencoesService.excluir(id);

    definirMensagem(
      requisicao,
      excluida ? 'sucesso' : 'erro',
      excluida
        ? 'Manutenção excluída com sucesso!'
        : 'Manutenção não encontrada.',
    );

    return resposta.redirect(302, '/manutencoes');
  }

  @Get(':id')
  async detalhes(
    @Param('id', ParseIntPipe) id: number,
    @Req() requisicao: Request,
    @Res() resposta: Response,
  ) {
    const manutencao = await this.manutencoesService.buscarPorId(id);

    if (!manutencao) {
      definirMensagem(requisicao, 'erro', 'Manutenção não encontrada.');
      return resposta.redirect(302, '/manutencoes');
    }

    return resposta.render('manutencoes/detalhes', {
      titulo: manutencao.tipo,
      pagina: 'manutencoes',
      manutencao,
      statusPossiveis: STATUS_POSSIVEIS,
    });
  }
}
