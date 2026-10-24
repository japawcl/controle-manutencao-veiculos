import { MigrationInterface, QueryRunner } from 'typeorm';
import { V7PlacaUnica1700000007000 } from '../migrations/1700000007000-V7PlacaUnica';

// A mesma regra de placa normalizada funciona nos dois bancos.
export class V2DemoPlacaUnica1700000011000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> { await new V7PlacaUnica1700000007000().up(q); }
  async down(q: QueryRunner): Promise<void> { await new V7PlacaUnica1700000007000().down(q); }
}
