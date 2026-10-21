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
import { PecasService } from './pecas.service';
import { SalvarPecaDto } from './dto/salvar-peca.dto';
import { validarFormulario } from '../comum/validacao';
import { definirMensagem } from '../comum/mensagens';

@Controller('pecas')
export class PecasController {
  constructor(private readonly pecasService: PecasService) {}

  @Get()
  @Render('pecas/lista')
  async lista() {
    return {
      titulo: 'Peças',
      pagina: 'pecas',
      pecas: await this.pecasService.listarTodas(),
      peca: {},
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
      SalvarPecaDto,
      corpo,
    );

    if (temErros) {
      return this.devolverFormulario(resposta, corpo, erros);
    }

    const resultado = await this.pecasService.cadastrar(dados);

    if (!resultado.ok) {
      return this.devolverFormulario(resposta, corpo, {
        nome: resultado.motivo,
      });
    }

    definirMensagem(requisicao, 'sucesso', 'Peça cadastrada com sucesso!');

    return resposta.redirect(302, '/pecas');
  }

  private async devolverFormulario(
    resposta: Response,
    peca: Record<string, unknown>,
    erros: Record<string, string>,
  ) {
    return resposta.status(200).render('pecas/lista', {
      titulo: 'Peças',
      pagina: 'pecas',
      pecas: await this.pecasService.listarTodas(),
      peca,
      erros,
    });
  }

  @Get(':id')
  async detalhes(@Param('id', ParseIntPipe) id: number, @Req() requisicao: Request, @Res() resposta: Response) {
    const registro = await this.pecasService.buscarPorId(id);
    if (!registro) {
      definirMensagem(requisicao, 'erro', 'Peça não encontrada.');
      return resposta.redirect(302, '/pecas');
    }
    return resposta.render('pecas/detalhes', { titulo: 'Detalhes', pagina: 'pecas', peca: registro,  });
  }

  @Get(':id/editar')
  async editar(@Param('id', ParseIntPipe) id: number, @Req() requisicao: Request, @Res() resposta: Response) {
    const registro = await this.pecasService.buscarPorId(id);
    if (!registro) {
      definirMensagem(requisicao, 'erro', 'Peça não encontrada.');
      return resposta.redirect(302, '/pecas');
    }
    return resposta.render('pecas/editar', { titulo: 'Editar Peça', pagina: 'pecas', peca: registro, erros: {} });
  }

  @Post(':id/editar')
  async atualizar(@Param('id', ParseIntPipe) id: number, @Body() corpo: Record<string, unknown>, @Req() requisicao: Request, @Res() resposta: Response) {
    const { dados, erros, temErros } = await validarFormulario(SalvarPecaDto, corpo);
    const motivo = temErros ? null : await this.pecasService.atualizar(id, dados);
    if (temErros || motivo) {
      return resposta.status(200).render('pecas/editar', {
        titulo: 'Editar Peça', pagina: 'pecas', peca: { ...corpo, id }, erros, erro: motivo,
      });
    }
    definirMensagem(requisicao, 'sucesso', 'Peça atualizada com sucesso!');
    return resposta.redirect(302, '/pecas');
  }

  @Post(':id/excluir')
  async excluir(@Param('id', ParseIntPipe) id: number, @Req() requisicao: Request, @Res() resposta: Response) {
    const motivo = await this.pecasService.excluir(id);
    definirMensagem(requisicao, motivo ? 'erro' : 'sucesso', motivo ?? 'Peça excluída com sucesso!');
    return resposta.redirect(302, '/pecas');
  }
}
