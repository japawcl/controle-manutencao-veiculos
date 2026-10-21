import { IsIn } from 'class-validator';
import { STATUS_POSSIVEIS, StatusManutencao } from '../manutencao.entity';
export class AlterarStatusDto {
  @IsIn(STATUS_POSSIVEIS, { message: 'Selecione um status válido.' })
  status: StatusManutencao;
}
