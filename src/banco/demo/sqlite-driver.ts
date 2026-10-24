// sql.js reabre a conexão ao exportar o arquivo e restaura PRAGMAs aos padrões.
// Reativar FKs após cada exportação mantém a proteção de vínculos no autoSave.
export async function iniciarSQLite(opcoes: unknown) {
  const sqlite = await require('sql.js')(opcoes);
  const BancoOriginal = sqlite.Database;
  sqlite.Database = class BancoComIntegridade extends BancoOriginal {
    export(): Uint8Array {
      try {
        return super.export();
      } finally {
        this.exec('PRAGMA foreign_keys = ON');
      }
    }
  };
  return sqlite;
}
