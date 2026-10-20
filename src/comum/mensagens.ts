import { Request, Response, NextFunction } from 'express';

export type TipoMensagem = 'sucesso' | 'erro';

interface SessaoComMensagens {
  sucesso?: string;
  erro?: string;
}

export function definirMensagem(
  requisicao: Request,
  tipo: TipoMensagem,
  texto: string,
): void {
  const sessao = requisicao.session as unknown as SessaoComMensagens;
  sessao[tipo] = texto;
}

export function mensagensFlash(
  requisicao: Request,
  resposta: Response,
  proximo: NextFunction,
): void {
  const sessao = requisicao.session as unknown as SessaoComMensagens;
  resposta.locals.sucesso = sessao?.sucesso;
  resposta.locals.erro = sessao?.erro;

  if (sessao) {
    delete sessao.sucesso;
    delete sessao.erro;
  }

  proximo();
}
