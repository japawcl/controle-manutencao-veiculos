import { Transform } from 'class-transformer';

// Não transformar ausência de informação em zero: o validador deve rejeitá-la.
export const NumeroFormulario = () => Transform(({ value }) =>
  typeof value === 'number' ? value :
  typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN,
);
export const TextoFormulario = () => Transform(({ value }) =>
  typeof value === 'string' ? value.trim() : value,
);
