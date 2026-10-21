import { NumeroFormulario, TextoFormulario } from '../../comum/transformacoes';
import { IsNotEmpty, Length } from 'class-validator';

export class SalvarPecaDto {
  @TextoFormulario()
  @IsNotEmpty({ message: 'O nome da peça é obrigatório.' })
  @Length(2, 80, { message: 'O nome deve ter entre 2 e 80 caracteres.' })
  nome: string;
}
