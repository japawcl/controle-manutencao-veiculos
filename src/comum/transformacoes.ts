import { Transform } from 'class-transformer';

// Validar a representação antes de converter: Number sozinho aceita 0x10 e 1e2.
export function inteiroFormulario(valor: unknown): number {
  if (typeof valor === 'number') return Number.isSafeInteger(valor) ? valor : NaN;
  if (typeof valor !== 'string' || !/^-?\d+$/.test(valor.trim())) return NaN;
  const numero = Number(valor.trim());
  return Number.isSafeInteger(numero) ? numero : NaN;
}
export function dinheiroFormulario(valor: unknown): number {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : NaN;
  if (typeof valor !== 'string') return NaN;
  const texto = valor.trim().replace(/^R\$\s*/, '');
  // Milhares brasileiros somente com vírgula decimal: 1.234,56.
  if (/^-?\d{1,3}(?:\.\d{3})+,\d{1,2}$/.test(texto)) {
    return Number(texto.replace(/\./g, '').replace(',', '.'));
  }
  if (/^-?\d+(?:[.,]\d{1,2})?$/.test(texto)) return Number(texto.replace(',', '.'));
  return NaN;
}
export function normalizarPlaca(valor: string): string {
  return valor.trim().toUpperCase().replace(/^([A-Z]{3})-/, '$1');
}
export const NumeroFormulario = () => Transform(({ value }) => inteiroFormulario(value));
export const DinheiroFormulario = () => Transform(({ value }) => dinheiroFormulario(value));
export const PlacaFormulario = () => Transform(({ value }) => typeof value === 'string' ? normalizarPlaca(value) : value);
export const TextoFormulario = () => Transform(({ value }) => typeof value === 'string' ? value.trim() : value);
