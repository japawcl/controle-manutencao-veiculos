import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pecas')
export class Peca {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 80 })
  nome: string;
}
