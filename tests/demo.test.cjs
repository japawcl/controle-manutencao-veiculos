const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdtempSync, readFileSync, writeFileSync, existsSync, unlinkSync, rmdirSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const net = require('node:net');
const { hojeNoBrasil } = require('../dist/comum/datas');
const hoje = hojeNoBrasil();
const initSql = require('sql.js');

async function portaLivre() {
  const servidor = net.createServer();
  await new Promise((ok, falha) => { servidor.once('error', falha); servidor.listen(0, '127.0.0.1', ok); });
  const porta = servidor.address().port;
  await new Promise(ok => servidor.close(ok));
  return porta;
}

test('demo funciona sem PostgreSQL: CRUD, integridade, recursos e persistência', { timeout: 60000 }, async () => {
  const pasta = mkdtempSync(join(tmpdir(), 'controle-demo-teste-'));
  const arquivo = join(pasta, 'teste.sqlite');
  const porta = await portaLivre();
  const raiz = resolve(__dirname, '..');
  let processo;
  let saida = '';
  const SQL = await initSql();
  async function iniciar() {
    saida = '';
    processo = spawn(process.execPath, ['scripts/demo.cjs'], {
      cwd: raiz, windowsHide: true,
      env: { ...process.env, PORT: String(porta), DEMO_DB_FILE: arquivo,
        BANCO_HOST: 'servidor-postgres-inexistente.invalid', BANCO_SENHA: 'nao-utilizada' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    processo.stdout.on('data', dado => { saida += dado; });
    processo.stderr.on('data', dado => { saida += dado; });
    for (let tentativa = 0; tentativa < 200; tentativa++) {
      if (processo.exitCode !== null) throw new Error(saida);
      if (saida.includes('Aplicação rodando')) return;
      await new Promise(ok => setTimeout(ok, 100));
    }
    throw new Error('Demonstração não iniciou: ' + saida);
  }
  async function parar() {
    if (!processo || processo.exitCode !== null) return;
    const terminou = new Promise(ok => processo.once('exit', ok));
    processo.kill();
    await terminou;
  }
  let cookie = '';
  async function pedir(caminho, dados) {
    const resposta = await fetch(`http://127.0.0.1:${porta}${caminho}`, {
      method: dados ? 'POST' : 'GET', redirect: 'manual',
      headers: { ...(cookie ? { cookie } : {}), ...(dados ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
      body: dados ? new URLSearchParams(Object.entries(dados).flatMap(([k,v]) => Array.isArray(v) ? v.map(x=>[k,x]) : [[k,v]])) : undefined,
    });
    const cookies = resposta.headers.getSetCookie();
    if (cookies.length) cookie = cookies.map(c=>c.split(';')[0]).join('; ');
    return { status: resposta.status, texto: await resposta.text() };
  }
  function consultar(sql) {
    const banco = new SQL.Database(readFileSync(arquivo));
    try { return banco.exec(sql)[0]?.values ?? []; } finally { banco.close(); }
  }
  try {
    await iniciar();
    assert.ok(existsSync(arquivo));
    assert.equal(consultar('SELECT count(*) FROM migrations')[0][0], 2);
    assert.equal(consultar('SELECT count(*) FROM veiculos')[0][0], 3);
    for (const rota of ['/', '/manutencoes', '/manutencoes/nova', '/manutencoes/1', '/manutencoes/1/editar', '/veiculos', '/veiculos/novo', '/veiculos/1', '/veiculos/1/editar', '/pecas', '/pecas/1', '/pecas/1/editar', '/js/app.js', '/css/style.css', '/img/veiculo.svg']) {
      assert.equal((await pedir(rota)).status, 200, rota);
    }
    assert.equal((await pedir('/veiculos', { apelido:'Veículo demo teste', marca:'Fiat', modelo:'Uno', placa:'ABC1234', ano:'2020', kmAtual:'100' })).status, 302);
    const veiculo = consultar("SELECT id FROM veiculos WHERE apelido = 'Veículo demo teste'")[0][0];
    assert.equal((await pedir('/pecas', {nome:'Peça demo teste'})).status, 302);
    const peca = consultar("SELECT id FROM pecas WHERE nome = 'Peça demo teste'")[0][0];
    assert.equal((await pedir('/manutencoes', { tipo:'Serviço demo teste', data:hoje, km:'200', custo:'12.34', veiculoId:veiculo, pecas:[peca,1], status:'Concluída' })).status, 302);
    const manutencao = consultar("SELECT id FROM manutencoes WHERE tipo = 'Serviço demo teste'")[0][0];
    assert.equal(consultar(`SELECT status FROM manutencoes WHERE id = ${manutencao}`)[0][0], 'Agendada');
    assert.equal(consultar(`SELECT count(*) FROM manutencao_pecas WHERE id_manutencao = ${manutencao}`)[0][0], 2);
    assert.equal(consultar(`SELECT km_atual FROM veiculos WHERE id = ${veiculo}`)[0][0], 100);
    // Os relacionamentos persistidos também devem aparecer nas páginas.
    const detalhes = (await pedir(`/manutencoes/${manutencao}`)).texto;
    assert.match(detalhes, /Veículo demo teste/);
    assert.match(detalhes, /Peça demo teste/);
    const historicoVeiculo = (await pedir(`/veiculos/${veiculo}`)).texto;
    assert.match(historicoVeiculo, /Serviço demo teste/);
    assert.ok(historicoVeiculo.includes(`/manutencoes/${manutencao}`));
    assert.match((await pedir('/')).texto, /Serviço demo teste/);

    assert.equal((await pedir(`/veiculos/${veiculo}/excluir`, {})).status, 302);
    assert.match((await pedir('/veiculos')).texto, /manutenções vinculadas/);
    assert.equal((await pedir(`/pecas/${peca}/excluir`, {})).status, 302);
    assert.match((await pedir('/pecas')).texto, /utilizada em manutenções/);
    assert.equal((await pedir(`/pecas/${peca}/editar`, { nome:'Óleo do motor' })).status, 200);
    assert.match((await pedir(`/pecas/${peca}/editar`, { nome:'Óleo do motor' })).texto, /Já existe/);
    assert.equal((await pedir(`/manutencoes/${manutencao}/editar`, { tipo:'Serviço demo editado', data:hoje, km:'210', custo:'20.00', veiculoId:veiculo, pecas:peca, status:'Concluída' })).status, 302);
    assert.equal(consultar(`SELECT km_atual FROM veiculos WHERE id = ${veiculo}`)[0][0], 210);
    await pedir(`/manutencoes/${manutencao}/status`, { status:'Agendada' });
    assert.equal(consultar(`SELECT status FROM manutencoes WHERE id = ${manutencao}`)[0][0], 'Concluída');
    await pedir(`/manutencoes/${manutencao}/status`, { status:'Cancelada' });
    assert.equal(consultar(`SELECT status FROM manutencoes WHERE id = ${manutencao}`)[0][0], 'Concluída');
    const erro = await pedir('/manutencoes', { tipo:'', descricao:'Preservar texto', data:hoje, km:'', custo:'', veiculoId:veiculo, pecas:peca });
    assert.equal(erro.status, 200); assert.match(erro.texto, /Preservar texto/);
    // Exercitar as mesmas proteções por HTTP, sem depender do JavaScript do navegador.
    const base = { tipo:'Validação HTTP', data:hoje, km:'999', custo:'1.234,56', veiculoId:veiculo };
    for (const campos of [
      { data:'2000-01-01' }, { custo:'0x10' }, { custo:'1e2' }, { custo:'1.234' },
      { custo:'-1' }, { custo:'100000000' }, { km:'1e2' }, { km:'0x10' },
      { km:'1.5' }, { km:'-1' }, { pecas:'0x1' }, { pecas:'1e0' }, { data:'2026-02-30' },
      { registro:'historico', data:'2099-01-01' },
    ]) {
      assert.equal((await pedir('/manutencoes', { ...base, ...campos })).status, 200, JSON.stringify(campos));
    }
    assert.equal(consultar("SELECT count(*) FROM manutencoes WHERE tipo = 'Validação HTTP'")[0][0], 0);
    assert.equal((await pedir('/manutencoes', {...base, data:'2099-01-01'})).status, 302);
    const futura = consultar("SELECT id FROM manutencoes WHERE tipo = 'Validação HTTP'")[0][0];
    for (const status of ['Em andamento', 'Concluída']) {
      await pedir(`/manutencoes/${futura}/status`, {status});
      assert.equal(consultar(`SELECT status FROM manutencoes WHERE id = ${futura}`)[0][0], 'Agendada');
      assert.equal((await pedir(`/manutencoes/${futura}/editar`, {...base, data:'2099-01-01', status})).status, 200);
    }
    assert.equal(consultar(`SELECT km_atual FROM veiculos WHERE id = ${veiculo}`)[0][0], 210);
    assert.equal(Number(consultar(`SELECT custo FROM manutencoes WHERE id = ${futura}`)[0][0]), 1234.56);
    await pedir(`/manutencoes/${futura}/excluir`, {});
    assert.equal((await pedir('/manutencoes', {...base, registro:'historico', data:'2000-01-01', custo:'R$ 100,50'})).status, 302);
    const historico = consultar("SELECT id FROM manutencoes WHERE tipo = 'Validação HTTP'")[0][0];
    assert.equal(consultar(`SELECT status FROM manutencoes WHERE id = ${historico}`)[0][0], 'Concluída');
    assert.equal(consultar(`SELECT km_atual FROM veiculos WHERE id = ${veiculo}`)[0][0], 999);
    await pedir(`/manutencoes/${historico}/status`, {status:'Em andamento'});
    await pedir(`/manutencoes/${historico}/status`, {status:'Agendada'});
    assert.equal(consultar(`SELECT status FROM manutencoes WHERE id = ${historico}`)[0][0], 'Concluída');
    await pedir(`/manutencoes/${historico}/excluir`, {});
    const carro = {apelido:'Duplicado', marca:'Fiat', modelo:'Uno', placa:'abc-1234', ano:'2020', kmAtual:'100'};
    const duplicada = await pedir('/veiculos', carro);
    assert.equal(duplicada.status, 200); assert.match(duplicada.texto, /Já existe um veículo/);
    assert.equal((await pedir('/veiculos', {...carro, placa:'XYZ9876', ano:'2100'})).status, 200);
    assert.equal((await pedir(`/veiculos/${veiculo}/editar`, {...carro, kmAtual:'999'})).status, 302);
    assert.equal(consultar(`SELECT placa FROM veiculos WHERE id = ${veiculo}`)[0][0], 'ABC1234');
    // O índice no banco também bloqueia variantes de uma placa existente.
    const bancoIndice = new SQL.Database(readFileSync(arquivo));
    try { assert.throws(() => bancoIndice.run("INSERT INTO veiculos(apelido,marca,modelo,placa,ano,km_atual) VALUES ('Duplicado','Fiat','Uno','abc-1234',2020,0)"), /UNIQUE/); }
    finally { bancoIndice.close(); }
    await parar();
    // Simula um arquivo criado pela versão anterior: aplicar apenas V2 preserva o histórico.
    const anterior = new SQL.Database(readFileSync(arquivo));
    try {
      anterior.run('DROP INDEX uq_veiculos_placa_normalizada');
      anterior.run("DELETE FROM migrations WHERE name = 'V2DemoPlacaUnica1700000011000'");
      writeFileSync(arquivo, anterior.export());
    } finally { anterior.close(); }
    await iniciar();
    assert.equal(consultar('SELECT count(*) FROM migrations')[0][0], 2);
    assert.match((await pedir(`/manutencoes/${manutencao}`)).texto, /Serviço demo editado/);
    assert.match((await pedir(`/manutencoes/${manutencao}`)).texto, /Peça demo teste/);
    assert.match((await pedir(`/veiculos/${veiculo}`)).texto, /Serviço demo editado/);
    await pedir(`/manutencoes/${manutencao}/excluir`, {});
    assert.equal(consultar(`SELECT count(*) FROM manutencao_pecas WHERE id_manutencao = ${manutencao}`)[0][0], 0);
    assert.equal(consultar(`SELECT count(*) FROM pecas WHERE id = ${peca}`)[0][0], 1);
    await pedir(`/pecas/${peca}/excluir`, {});
    await pedir(`/veiculos/${veiculo}/excluir`, {});
    assert.equal(consultar(`SELECT count(*) FROM veiculos WHERE id = ${veiculo}`)[0][0], 0);
    assert.equal(consultar(`SELECT count(*) FROM pecas WHERE id = ${peca}`)[0][0], 0);
  } finally {
    await parar();
    if (existsSync(arquivo)) unlinkSync(arquivo);
    rmdirSync(pasta);
  }
});
