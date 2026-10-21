require('reflect-metadata');
const { dataSource } = require('../dist/banco/data-source');
(async () => {
  dataSource.setOptions({ migrationsRun: false });
  try {
    await dataSource.initialize();
    const runner = dataSource.createQueryRunner();
    try {
      const erros = [];
      const tipos = { bigint: 'bigint', integer: 'integer', int: 'integer', varchar: 'character varying', text: 'text', date: 'date', numeric: 'numeric' };
      for (const entidade of dataSource.entityMetadatas) {
        const colunas = await runner.query(`SELECT column_name, data_type, is_nullable, character_maximum_length FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`, [entidade.tableName]);
        if (!colunas.length) { erros.push(`Tabela ausente: ${entidade.tableName}`); continue; }
        for (const coluna of entidade.columns) {
          const existente = colunas.find(c => c.column_name === coluna.databaseName);
          if (!existente) { erros.push(`Coluna ausente: ${entidade.tableName}.${coluna.databaseName}`); continue; }
          const tipo = coluna.type === String ? 'character varying' : coluna.type === Number ? 'integer' : tipos[coluna.type];
          if (tipo && existente.data_type !== tipo) erros.push(`Tipo divergente: ${entidade.tableName}.${coluna.databaseName}`);
          if ((existente.is_nullable === 'YES') !== coluna.isNullable) erros.push(`Nulabilidade divergente: ${entidade.tableName}.${coluna.databaseName}`);
          if (coluna.length && Number(existente.character_maximum_length) !== Number(coluna.length)) erros.push(`Tamanho divergente: ${entidade.tableName}.${coluna.databaseName}`);
        }
      }
      if (await dataSource.showMigrations()) erros.push('Existem migrations pendentes.');
      if (erros.length) throw new Error(erros.join('\n'));
      console.log('Schema: tabelas, colunas, tipos, nulabilidade, tamanhos e migrations conferidos.');
      console.log('Este comando não substitui uma verificação completa de todas as constraints.');
    } finally { await runner.release(); }
  } catch (erro) { console.error(erro.message); process.exitCode = 1; }
  finally { if (dataSource.isInitialized) await dataSource.destroy(); }
})();
