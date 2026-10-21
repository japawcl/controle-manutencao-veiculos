import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pecas')
export class Peca {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ length: 80, unique: true })
  nome: string;
}
