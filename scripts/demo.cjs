// Executável em Windows, macOS e Linux: SQLite via sql.js dispensa servidor e compilação nativa.
const { mkdirSync } = require('node:fs');
const { dirname, resolve } = require('node:path');
const raiz = resolve(__dirname, '..');
process.chdir(raiz);
process.env.MODO_DEMO = '1';
process.env.DEMO_DB_FILE = resolve(process.env.DEMO_DB_FILE || resolve(raiz, '.dados', 'demo.sqlite'));
mkdirSync(dirname(process.env.DEMO_DB_FILE), { recursive: true });
console.log('Modo de demonstração: SQLite local, sem PostgreSQL ou senha.');
console.log('Os dados ficam salvos em:', process.env.DEMO_DB_FILE);
require('ts-node/register');
require('../src/main.ts');
