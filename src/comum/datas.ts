import { registerDecorator } from 'class-validator';

// Dia de negócio no Brasil, independente do fuso configurado no computador.
export function hojeNoBrasil(instante = new Date()): string {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(instante);
  const obter = (tipo: string) => partes.find(p => p.type === tipo)!.value;
  return `${obter('year')}-${obter('month')}-${obter('day')}`;
}
export function anoModeloMaximo(): number {
  return Number(hojeNoBrasil().slice(0, 4)) + 1;
}
export function AnoModeloPermitido(): PropertyDecorator {
  return (alvo, propriedade) => registerDecorator({
    name: 'anoModeloPermitido', target: alvo.constructor, propertyName: String(propriedade),
    validator: {
      validate: (valor: unknown) => typeof valor === 'number' && Number.isInteger(valor) && valor <= anoModeloMaximo(),
      defaultMessage: () => `O ano-modelo não pode ultrapassar ${anoModeloMaximo()}.`,
    },
  });
}
