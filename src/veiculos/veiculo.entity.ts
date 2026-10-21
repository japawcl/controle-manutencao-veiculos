import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('veiculos')
export class Veiculo {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ length: 60 })
  apelido: string;

  @Column({ length: 60 })
  marca: string;

  @Column({ length: 60 })
  modelo: string;

  @Column({ length: 10 })
  placa: string;

  @Column()
  ano: number;

  @Column({ name: 'km_atual' })
  kmAtual: number;
}
