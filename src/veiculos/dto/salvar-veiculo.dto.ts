import { AnoModeloPermitido } from '../../comum/datas';
import { NumeroFormulario, TextoFormulario, PlacaFormulario } from '../../comum/transformacoes';
import {
  IsInt,
  IsNotEmpty,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class SalvarVeiculoDto {
  @TextoFormulario()
  @IsNotEmpty({ message: 'O apelido é obrigatório.' })
  @Length(2, 60, { message: 'O apelido deve ter entre 2 e 60 caracteres.' })
  apelido: string;

  @TextoFormulario()
  @IsNotEmpty({ message: 'A marca é obrigatória.' })
  @Length(2, 60, { message: 'A marca deve ter entre 2 e 60 caracteres.' })
  marca: string;

  @TextoFormulario()
  @IsNotEmpty({ message: 'O modelo é obrigatório.' })
  @Length(2, 60, { message: 'O modelo deve ter entre 2 e 60 caracteres.' })
  modelo: string;

  @PlacaFormulario()
  @IsNotEmpty({ message: 'A placa é obrigatória.' })
  @Matches(/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/, {
    message: 'Informe a placa no formato ABC-1234 ou ABC-1D23.',
  })
  placa: string;

  @NumeroFormulario()
  @IsInt({ message: 'O ano deve ser um número inteiro.' })
  @Min(1950, { message: 'O ano deve ser 1950 ou posterior.' })
  @AnoModeloPermitido()
  ano: number;

  @NumeroFormulario()
  @IsInt({ message: 'A quilometragem deve ser um número inteiro.' })
  @Min(0, { message: 'A quilometragem não pode ser negativa.' })
  @Max(2147483647, { message: 'A quilometragem ultrapassa o limite permitido.' })
  kmAtual: number;
}
