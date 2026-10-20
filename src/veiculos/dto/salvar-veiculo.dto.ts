import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class SalvarVeiculoDto {
  @IsNotEmpty({ message: 'O apelido é obrigatório.' })
  @Length(2, 60, { message: 'O apelido deve ter entre 2 e 60 caracteres.' })
  apelido: string;

  @IsNotEmpty({ message: 'A marca é obrigatória.' })
  @Length(2, 60, { message: 'A marca deve ter entre 2 e 60 caracteres.' })
  marca: string;

  @IsNotEmpty({ message: 'O modelo é obrigatório.' })
  @Length(2, 60, { message: 'O modelo deve ter entre 2 e 60 caracteres.' })
  modelo: string;

  @IsNotEmpty({ message: 'A placa é obrigatória.' })
  @Matches(/^[A-Za-z]{3}-?[0-9][0-9A-Za-z][0-9]{2}$/, {
    message: 'Informe a placa no formato ABC-1234 ou ABC-1D23.',
  })
  placa: string;

  @Type(() => Number)
  @IsInt({ message: 'O ano deve ser um número inteiro.' })
  @Min(1950, { message: 'O ano deve ser 1950 ou posterior.' })
  @Max(2100, { message: 'O ano informado é inválido.' })
  ano: number;

  @Type(() => Number)
  @IsInt({ message: 'A quilometragem deve ser um número inteiro.' })
  @Min(0, { message: 'A quilometragem não pode ser negativa.' })
  kmAtual: number;
}
