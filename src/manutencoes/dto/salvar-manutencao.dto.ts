import { NumeroFormulario, TextoFormulario, DinheiroFormulario } from '../../comum/transformacoes';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
  Matches,
  MaxLength,
  Max,
  Min,
} from 'class-validator';
import { STATUS_POSSIVEIS, StatusManutencao } from '../manutencao.entity';

export class SalvarManutencaoDto {
  @IsOptional()
  @IsIn(['agendamento', 'historico'], { message: 'Selecione agendamento ou serviço já realizado.' })
  registro: 'agendamento' | 'historico' = 'agendamento';

  @TextoFormulario()
  @IsNotEmpty({ message: 'O tipo de serviço é obrigatório.' })
  @Length(3, 100, {
    message: 'O tipo de serviço deve ter entre 3 e 100 caracteres.',
  })
  tipo: string;

  @TextoFormulario()
  @IsOptional()
  @MaxLength(1000, {
    message: 'A descrição deve possuir no máximo 1000 caracteres.',
  })
  descricao: string;

  @TextoFormulario()
  @IsOptional()
  @MaxLength(120, {
    message: 'A oficina deve possuir no máximo 120 caracteres.',
  })
  oficina: string;

  @IsDateString({ strict: true }, { message: 'Informe uma data válida.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Informe a data no formato ano-mês-dia.' })
  data: string;

  @NumeroFormulario()
  @IsInt({ message: 'A quilometragem deve ser um número inteiro.' })
  @Min(0, { message: 'A quilometragem não pode ser negativa.' })
  @Max(2147483647, { message: 'A quilometragem ultrapassa o limite permitido.' })
  km: number;

  @DinheiroFormulario()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Informe um custo válido, como 100,50 ou 1.234,56, com até duas casas decimais.' })
  @Min(0, { message: 'O custo não pode ser negativo.' })
  @Max(99999999.99, { message: 'O custo ultrapassa o limite permitido.' })
  custo: number;

  @NumeroFormulario()
  @IsInt({ message: 'Selecione o veículo.' })
  @Min(1, { message: 'Selecione o veículo.' })
  @Max(Number.MAX_SAFE_INTEGER, { message: 'Selecione um veículo válido.' })
  veiculoId: number;

  @IsOptional()
  @IsIn(STATUS_POSSIVEIS, { message: 'Selecione um status válido.' })
  status: StatusManutencao;
}
