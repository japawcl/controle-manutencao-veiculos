// O launcher demo define a opção antes de carregar as entidades.
export const modoDemo = process.env.MODO_DEMO === '1';
export const tipoId: 'integer' | 'bigint' = modoDemo ? 'integer' : 'bigint';
