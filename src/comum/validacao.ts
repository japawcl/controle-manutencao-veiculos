import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export type ErrosFormulario = Record<string, string>;

export interface ResultadoValidacao<T> {
  dados: T;
  erros: ErrosFormulario;
  temErros: boolean;
}

const PRIORIDADE = [
  'isNotEmpty',
  'isDateString',
  'isInt',
  'isNumber',
  'isIn',
  'matches',
  'length',
  'maxLength',
  'min',
  'max',
];

function mensagemMaisEspecifica(restricoes: Record<string, string>): string {
  for (const regra of PRIORIDADE) {
    if (restricoes[regra]) {
      return restricoes[regra];
    }
  }

  return Object.values(restricoes)[0];
}

export async function validarFormulario<T extends object>(
  Classe: new () => T,
  corpo: unknown,
): Promise<ResultadoValidacao<T>> {
  const dados = plainToInstance(Classe, corpo ?? {});
  const falhas = await validate(dados as object, { whitelist: true });

  const erros: ErrosFormulario = {};
  for (const falha of falhas) {
    const restricoes = falha.constraints;
    if (restricoes && Object.keys(restricoes).length > 0) {
      erros[falha.property] = mensagemMaisEspecifica(restricoes);
    }
  }

  return { dados, erros, temErros: falhas.length > 0 };
}

export function comoLista(valor: unknown): string[] {
  if (valor === undefined || valor === null || valor === '') return [];
  return Array.isArray(valor) ? valor.map(String) : [String(valor)];
}
