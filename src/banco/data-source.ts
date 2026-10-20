import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { Veiculo } from '../veiculos/veiculo.entity';
import { Manutencao } from '../manutencoes/manutencao.entity';
import { Peca } from '../pecas/peca.entity';

export const opcoesBanco: DataSourceOptions = {
  type: 'postgres',
  host: process.env.BANCO_HOST ?? 'localhost',
  port: Number(process.env.BANCO_PORTA ?? 5432),
  username: process.env.BANCO_USUARIO ?? 'postgres',
  password: process.env.BANCO_SENHA ?? 'postgres',
  database: process.env.BANCO_NOME ?? 'controle_manutencao',
  entities: [Veiculo, Manutencao, Peca],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  migrationsRun: true,
  logging: ['error', 'migration'],
};

export const dataSource = new DataSource(opcoesBanco);
export default dataSource;
