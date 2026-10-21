const { test } = require('node:test');
const assert = require('node:assert/strict');
require('reflect-metadata');
const { validarFormulario } = require('../dist/comum/validacao');
const { SalvarManutencaoDto } = require('../dist/manutencoes/dto/salvar-manutencao.dto');
const { SalvarPecaDto } = require('../dist/pecas/dto/salvar-peca.dto');
const { AlterarStatusDto } = require('../dist/manutencoes/dto/alterar-status.dto');
const { ManutencoesService } = require('../dist/manutencoes/manutencoes.service');
const { PecasService } = require('../dist/pecas/pecas.service');
const { VeiculosService } = require('../dist/veiculos/veiculos.service');
const dados = { tipo: 'Troca de óleo', data: '2026-10-20', km: '0', custo: '0', veiculoId: '1' };

test('campos numéricos vazios não se confundem com zero', async () => {
  assert.equal((await validarFormulario(SalvarManutencaoDto, dados)).temErros, false);
  for (const campo of ['km', 'custo', 'veiculoId']) {
    const resultado = await validarFormulario(SalvarManutencaoDto, { ...dados, [campo]: '' });
    assert.ok(resultado.erros[campo]);
  }
});
test('textos são normalizados antes da validação e espaços são rejeitados', async () => {
  assert.equal((await validarFormulario(SalvarPecaDto, { nome: '  ' })).temErros, true);
  assert.equal((await validarFormulario(SalvarPecaDto, { nome: '  Óleo  ' })).dados.nome, 'Óleo');
  assert.ok((await validarFormulario(SalvarManutencaoDto, { ...dados, tipo: '   ' })).erros.tipo);
});
test('data impossível e custo com precisão excessiva são rejeitados', async () => {
  assert.ok((await validarFormulario(SalvarManutencaoDto, { ...dados, data: '2026-02-30' })).erros.data);
  assert.ok((await validarFormulario(SalvarManutencaoDto, { ...dados, custo: '1.234' })).erros.custo);
});
test('rota de status possui validação executável, inclusive para ausência', async () => {
  for (const status of [undefined, 'Cancelada', '', ['Agendada']]) {
    assert.equal((await validarFormulario(AlterarStatusDto, { status })).temErros, true);
  }
  assert.equal((await validarFormulario(AlterarStatusDto, { status: 'Concluída' })).temErros, false);
});
test('service impede transição proibida e valores fora do domínio', async () => {
  let saves = 0;
  const repo = { findOne: async () => ({ id: '1', status: 'Concluída' }), save: async x => { saves++; return x; } };
  const service = new ManutencoesService(repo, {}, {});
  assert.equal((await service.alterarStatus(1, 'Agendada')).ok, false);
  assert.equal((await service.alterarStatus(1, 'Cancelada')).ok, false);
  assert.equal(saves, 0);
  assert.equal((await service.alterarStatus(1, 'Concluída')).ok, true);
});
test('peça inexistente ou identificador malformado não é descartado silenciosamente', async () => {
  const service = new PecasService({ find: async () => [{ id: '1', nome: 'Óleo' }] });
  assert.equal(await service.buscarPorIds([NaN]), null);
  assert.equal(await service.buscarPorIds([-1]), null);
  assert.equal(await service.buscarPorIds([1, 2]), null);
  assert.deepEqual(await service.buscarPorIds([1, 1]), [{ id: '1', nome: 'Óleo' }]);
});
test('cadastro decide status inicial e não salva se uma relação não existir', async () => {
  let salvo;
  const repo = { create: x => x, save: async x => { salvo = x; return x; } };
  const service = new ManutencoesService(repo, { buscarPorId: async () => ({ id: '1' }), atualizarKm: async () => {} }, { buscarPorIds: async () => [] });
  assert.equal((await service.cadastrar({ ...dados, status: 'Concluída' }, [])).ok, true);
  assert.equal(salvo.status, 'Agendada');
  const invalido = new ManutencoesService(repo, { buscarPorId: async () => null }, {});
  assert.equal((await invalido.cadastrar(dados, [])).ok, false);
});
test('odômetro não diminui e exclusão respeita veículos vinculados', async () => {
  const veiculo = { id: '1', kmAtual: 100 };
  let saves = 0;
  const service = new VeiculosService({ findOneBy: async () => veiculo, save: async () => { saves++; }, delete: async () => { throw { driverError: { code: '23503' } }; } });
  await service.atualizarKm('1', 90);
  assert.equal(saves, 0);
  await service.atualizarKm('1', 120);
  assert.equal(veiculo.kmAtual, 120);
  assert.match(await service.excluir(1), /manutenções vinculadas/);
});
