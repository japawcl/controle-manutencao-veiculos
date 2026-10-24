const { test } = require('node:test');
const assert = require('node:assert/strict');
require('reflect-metadata');
const { validarFormulario } = require('../dist/comum/validacao');
const { hojeNoBrasil, anoModeloMaximo } = require('../dist/comum/datas');
const { SalvarManutencaoDto } = require('../dist/manutencoes/dto/salvar-manutencao.dto');
const { SalvarVeiculoDto } = require('../dist/veiculos/dto/salvar-veiculo.dto');
const { ManutencoesService } = require('../dist/manutencoes/manutencoes.service');
const { VeiculosService } = require('../dist/veiculos/veiculos.service');
const base = { tipo:'Troca de óleo', data:hojeNoBrasil(), km:'100', custo:'100', veiculoId:'1' };

test('dinheiro aceita formatos decimais brasileiros e rejeita conversões ambíguas', async () => {
  for (const [custo, esperado] of [['100,50',100.5],['100.50',100.5],['1.234,56',1234.56],['R$ 100,50',100.5],['0',0],['99999999.99',99999999.99]]) {
    const r = await validarFormulario(SalvarManutencaoDto, {...base,custo});
    assert.equal(r.temErros,false,custo); assert.equal(r.dados.custo,esperado);
  }
  for (const custo of ['0x10','1e2','1.234','1,234','-1','100000000','',null,[],{},'1.23,45','NaN','Infinity']) {
    assert.ok((await validarFormulario(SalvarManutencaoDto,{...base,custo})).erros.custo,JSON.stringify(custo));
  }
});
test('quilometragem e identificadores rejeitam hexadecimais, expoentes e frações', async () => {
  for (const campo of ['km','veiculoId']) for (const valor of ['0x10','1e2','1.5','9007199254740992',[],null]) {
    assert.ok((await validarFormulario(SalvarManutencaoDto,{...base,[campo]:valor})).erros[campo]);
  }
  assert.ok((await validarFormulario(SalvarManutencaoDto,{...base,km:'2147483648'})).erros.km);
});
test('ano-modelo acompanha o ano corrente e placa é normalizada', async () => {
  const carro = {apelido:'Meu carro',marca:'Fiat',modelo:'Uno',ano:String(anoModeloMaximo()),kmAtual:'0',placa:' abc-1d23 '};
  const r = await validarFormulario(SalvarVeiculoDto,carro);
  assert.equal(r.temErros,false); assert.equal(r.dados.placa,'ABC1D23');
  for (const ano of [String(anoModeloMaximo()+1),'1949','1e3','0x7e8']) {
    assert.ok((await validarFormulario(SalvarVeiculoDto,{...carro,ano})).erros.ano);
  }
});
test('dia de referência usa São Paulo inclusive na virada do ano em UTC', () => {
  assert.equal(hojeNoBrasil(new Date('2027-01-01T02:59:59Z')),'2026-12-31');
  assert.equal(hojeNoBrasil(new Date('2027-01-01T03:00:00Z')),'2027-01-01');
});
function servico(original) {
  const salvos = [];
  const repo = { findOne:async()=>original, create:x=>x, salvarComOdometro:async(x,odometro)=>{salvos.push({x,odometro});return x;} };
  return {salvos,service:new ManutencoesService(repo,{buscarPorId:async()=>({id:'1'})},{buscarPorIds:async()=>[]})};
}
test('agendamento não permite passado; histórico permite passado e não futuro', async () => {
  const {service,salvos} = servico();
  assert.equal((await service.cadastrar({...base,data:'2000-01-01'},[])).ok,false);
  assert.equal((await service.cadastrar({...base,data:'2099-01-01',registro:'historico'},[])).ok,false);
  assert.equal((await service.cadastrar({...base,data:'2099-01-01'},[])).ok,true);
  assert.equal(salvos[0].odometro,false);
  assert.equal((await service.cadastrar({...base,data:'2000-01-01',registro:'historico'},[])).ok,true);
  assert.equal(salvos[1].x.status,'Concluída'); assert.equal(salvos[1].odometro,true);
});
test('edição e troca de status não concluem serviço futuro nem retrocedem status', async () => {
  for (const atual of ['Agendada','Em andamento','Concluída']) {
    for (const proximo of ['Agendada','Em andamento','Concluída']) {
      const {service} = servico({id:'1',data:base.data,status:atual,veiculo:{id:'1'}});
      const permitido = ['Agendada','Em andamento','Concluída'].indexOf(proximo)>=['Agendada','Em andamento','Concluída'].indexOf(atual);
      assert.equal((await service.alterarStatus(1,proximo)).ok,permitido,`${atual} -> ${proximo}`);
    }
  }
  for (const status of ['Em andamento','Concluída']) {
    const {service,salvos} = servico({id:'1',data:'2099-01-01',status:'Agendada',veiculo:{id:'1'}});
    assert.equal((await service.alterarStatus(1,status)).ok,false);
    assert.equal((await service.atualizar(1,{...base,data:'2099-01-01',status},[])).ok,false);
    assert.equal(salvos.length,0);
  }
});
test('agendamento vencido permite corrigir outros campos, sem criar outra data passada', async () => {
  const {service} = servico({id:'1',data:'2000-01-01',status:'Agendada',veiculo:{id:'1'}});
  assert.equal((await service.atualizar(1,{...base,data:'2000-01-02'},[])).ok,false);
  assert.equal((await service.atualizar(1,{...base,data:'2000-01-01'},[])).ok,true);
});
test('placa duplicada é rejeitada no cadastro e edição, mas a própria placa pode permanecer', async () => {
  let saves = 0;
  const repo = {buscarPorPlaca:async()=>({id:'1'}), findOneBy:async()=>({id:'2',kmAtual:0}),save:async()=>{saves++;}};
  const service = new VeiculosService(repo);
  const carro = {placa:'abc-1234',kmAtual:0};
  assert.equal((await service.cadastrar(carro)).ok,false);
  assert.match(await service.atualizar(2,carro),/Já existe/);
  assert.equal(saves,0);
  assert.equal(await service.atualizar(1,carro),null); assert.equal(saves,1);
});
