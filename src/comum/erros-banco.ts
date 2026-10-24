// Preservar o mesmo feedback no PostgreSQL e no SQLite de demonstração.
function detalhes(erro: unknown): { code?: string; message?: string } {
  const falha = erro as { driverError?: { code?: string; message?: string }; message?: string };
  return falha?.driverError ?? falha ?? {};
}
export function violacaoDeVinculo(erro: unknown): boolean {
  const falha = detalhes(erro);
  return falha.code === '23503' || /FOREIGN KEY constraint failed/i.test(falha.message ?? '');
}
export function violacaoDeUnicidade(erro: unknown): boolean {
  const falha = detalhes(erro);
  return falha.code === '23505' || /UNIQUE constraint failed/i.test(falha.message ?? '');
}
