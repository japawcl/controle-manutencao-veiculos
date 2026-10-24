import { tipoId } from '../banco/modo-demo';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Veiculo } from '../veiculos/veiculo.entity';
import { Peca } from '../pecas/peca.entity';

export type StatusManutencao = 'Agendada' | 'Em andamento' | 'Concluída';

export const STATUS_POSSIVEIS: StatusManutencao[] = [
  'Agendada',
  'Em andamento',
  'Concluída',
];

const dinheiro = {
  to: (valor: number) => valor,
  from: (valor: string | null) => (valor === null ? 0 : Number(valor)),
};

@Entity('manutencoes')
export class Manutencao {
  @PrimaryGeneratedColumn({ type: tipoId })
  id: string;

  @Column({ length: 100 })
  tipo: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ length: 120, nullable: true })
  oficina: string;

  @Column({ type: 'date' })
  data: string;

  @Column()
  km: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: dinheiro })
  custo: number;

  @Column({ length: 20 })
  status: StatusManutencao;

  @ManyToOne(() => Veiculo, { nullable: false })
  @JoinColumn({ name: 'id_veiculo' })
  veiculo: Veiculo;

  @ManyToMany(() => Peca)
  @JoinTable({
    name: 'manutencao_pecas',
    joinColumn: { name: 'id_manutencao', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_peca', referencedColumnName: 'id' },
  })
  pecas: Peca[];
}
