import { ParadasPort } from '../dominio/paradas-port';
import { Parada } from '../dominio/parada';
import { Coordenada } from '../dominio/coordenada';
import type { RutasApi } from '../../rutas'; // API pública (index.ts) del módulo Rutas

export class RutasApiAdapter implements ParadasPort {
  constructor(private readonly rutasApi: RutasApi) {}

  async buscarPorId(paradaId: string): Promise<Parada | null> {
    const dto = await this.rutasApi.obtenerParada(paradaId);
    if (!dto) return null;
    // Se traduce el DTO del otro módulo a NUESTRO modelo de dominio
    return new Parada(dto.id, dto.rutaId, dto.nombre, dto.orden, new Coordenada(dto.latitud, dto.longitud));
  }
}
