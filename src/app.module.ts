import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { opcoesBanco } from './banco/data-source';
import { DashboardController } from './dashboard.controller';
import { VeiculosController } from './veiculos/veiculos.controller';
import { VeiculosService } from './veiculos/veiculos.service';
import { VeiculosRepository } from './veiculos/veiculos.repository';
import { ManutencoesController } from './manutencoes/manutencoes.controller';
import { ManutencoesService } from './manutencoes/manutencoes.service';
import { ManutencoesRepository } from './manutencoes/manutencoes.repository';
import { PecasController } from './pecas/pecas.controller';
import { PecasService } from './pecas/pecas.service';
import { PecasRepository } from './pecas/pecas.repository';

@Module({
  imports: [TypeOrmModule.forRoot(opcoesBanco)],
  controllers: [
    DashboardController,
    VeiculosController,
    ManutencoesController,
    PecasController,
  ],
  providers: [
    VeiculosRepository,
    VeiculosService,
    ManutencoesRepository,
    ManutencoesService,
    PecasRepository,
    PecasService,
  ],
})
export class AppModule {}
