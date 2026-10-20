import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { STATUS_POSSIVEIS, StatusManutencao } from '../manutencao.entity';

export class SalvarManutencaoDto {
  @IsNotEmpty({ message: 'O tipo de serviço é obrigatório.' })
  @Length(3, 100, {
    message: 'O tipo de serviço deve ter entre 3 e 100 caracteres.',
  })
  tipo: string;

  @IsOptional()
  @MaxLength(1000, {
    message: 'A descrição deve possuir no máximo 1000 caracteres.',
  })
  descricao: string;

  @IsOptional()
  @MaxLength(120, {
    message: 'A oficina deve possuir no máximo 120 caracteres.',
  })
  oficina: string;

  @IsDateString({}, { message: 'Informe uma data válida.' })
  data: string;

  @Type(() => Number)
  @IsInt({ message: 'A quilometragem deve ser um número inteiro.' })
  @Min(0, { message: 'A quilometragem não pode ser negativa.' })
  km: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'O custo deve ser um valor numérico.' })
  @Min(0, { message: 'O custo não pode ser negativo.' })
  custo: number;

  @Type(() => Number)
  @IsInt({ message: 'Selecione o veículo.' })
  @Min(1, { message: 'Selecione o veículo.' })
  veiculoId: number;

  @IsOptional()
  @IsIn(STATUS_POSSIVEIS, { message: 'Selecione um status válido.' })
  status: StatusManutencao;
}
