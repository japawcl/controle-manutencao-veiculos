export type StatusManutencao = 'Agendada' | 'Em andamento' | 'Concluída';

export class Manutencao {
  id: number;
  veiculoId: number;
  tipo: string;
  descricao: string;
  oficina: string;
  data: string;
  km: number;
  custo: number;
  status: StatusManutencao;
}

export class CriarManutencaoDto {
  veiculoId: string;
  tipo: string;
  descricao: string;
  oficina: string;
  data: string;
  km: string;
  custo: string;
  status: StatusManutencao;
}
