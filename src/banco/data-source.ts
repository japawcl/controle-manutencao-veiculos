import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join, resolve } from 'path';
import { modoDemo } from './modo-demo';
import { iniciarSQLite } from './demo/sqlite-driver';
import { V1Demo1700000010000 } from './demo/1700000010000-V1Demo';
import { V2DemoPlacaUnica1700000011000 } from './demo/1700000011000-V2DemoPlacaUnica';
import { Veiculo } from '../veiculos/veiculo.entity';
import { Manutencao } from '../manutencoes/manutencao.entity';
import { Peca } from '../pecas/peca.entity';

const entidades = [Veiculo, Manutencao, Peca];

// SQLite é exclusivo da demonstração. PostgreSQL mantém suas migrations originais.
export const opcoesBanco: DataSourceOptions = modoDemo ? {
  type: 'sqljs',
  driver: iniciarSQLite,
  location: resolve(process.env.DEMO_DB_FILE ?? join(process.cwd(), '.dados', 'demo.sqlite')),
  autoSave: true,
  entities: entidades,
  migrations: [V1Demo1700000010000, V2DemoPlacaUnica1700000011000],
  synchronize: false,
  migrationsRun: true,
  logging: ['error', 'migration'],
} : {
  type: 'postgres',
  host: process.env.BANCO_HOST ?? 'localhost',
  port: Number(process.env.BANCO_PORTA ?? 5432),
  username: process.env.BANCO_USUARIO ?? 'postgres',
  password: process.env.BANCO_SENHA ?? 'postgres',
  database: process.env.BANCO_NOME ?? 'controle_manutencao',
  entities: entidades,
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  migrationsRun: true,
  logging: ['error', 'migration'],
};

export const dataSource = new DataSource(opcoesBanco);
export default dataSource;
