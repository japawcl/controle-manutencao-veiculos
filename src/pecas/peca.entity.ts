import { tipoId } from '../banco/modo-demo';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pecas')
export class Peca {
  @PrimaryGeneratedColumn({ type: tipoId })
  id: string;

  @Column({ length: 80, unique: true })
  nome: string;
}
