import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { VeiculosController } from './veiculos/veiculos.controller';
import { VeiculosService } from './veiculos/veiculos.service';
import { ManutencoesController } from './manutencoes/manutencoes.controller';
import { ManutencoesService } from './manutencoes/manutencoes.service';

@Module({
  controllers: [DashboardController, VeiculosController, ManutencoesController],
  providers: [VeiculosService, ManutencoesService],
})
export class AppModule {}
