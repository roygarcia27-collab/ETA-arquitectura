import { RoutingPort, ResultadoRuta } from '../dominio/routing-port';
import { Coordenada } from '../dominio/coordenada';

/**
 * TODO (opcional): adaptador alternativo a OSRM usando Mapbox Directions.
 * Solo hay que implementar calcularRuta() y cambiar el adaptador en eta.module.ts.
 */
export class MapboxRoutingAdapter implements RoutingPort {
  constructor(private readonly accessToken: string) {}

  async calcularRuta(_origen: Coordenada, _destino: Coordenada): Promise<ResultadoRuta> {
    throw new Error('MapboxRoutingAdapter no implementado todavía');
  }
}
