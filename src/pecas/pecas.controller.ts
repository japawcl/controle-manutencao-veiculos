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

    if (!temErros && (await this.pecasService.existeComNome(dados.nome.trim()))) {
      erros.nome = 'Já existe uma peça com esse nome.';
    }

    if (Object.keys(erros).length > 0) {
      return resposta.status(200).render('pecas/lista', {
        titulo: 'Peças',
        pagina: 'pecas',
        pecas: await this.pecasService.listarTodas(),
        peca: corpo,
        erros,
      });
    }

    await this.pecasService.cadastrar(dados);
    definirMensagem(requisicao, 'sucesso', 'Peça cadastrada com sucesso!');

    return resposta.redirect(302, '/pecas');
  }
}
