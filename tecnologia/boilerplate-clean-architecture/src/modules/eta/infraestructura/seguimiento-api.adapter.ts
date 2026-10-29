import { PosicionesPort } from '../dominio/posiciones-port';
import { PosicionVehiculo } from '../dominio/posicion-vehiculo';
import { Coordenada } from '../dominio/coordenada';
import type { SeguimientoApi } from '../../seguimiento'; // API pública del módulo Seguimiento

export class SeguimientoApiAdapter implements PosicionesPort {
  constructor(private readonly seguimientoApi: SeguimientoApi) {}

  async obtenerVigentesPorRuta(rutaId: string): Promise<PosicionVehiculo[]> {
    const dtos = await this.seguimientoApi.obtenerPosicionesVigentes(rutaId);
    return dtos.map(
      (d) =>
        new PosicionVehiculo(
          d.vehiculoId, d.rutaId, new Coordenada(d.latitud, d.longitud),
          d.velocidadKmh, d.ultimaParadaOrden, new Date(d.registradaEn),
        ),
    );
  }
}
