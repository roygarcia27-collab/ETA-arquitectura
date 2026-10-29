import { Parada } from './parada';
export interface ParadasPort {
  buscarPorId(paradaId: string): Promise<Parada | null>;
}
