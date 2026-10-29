import { RoutingPort, ResultadoRuta } from '../dominio/routing-port';
import { Coordenada } from '../dominio/coordenada';

export class OsrmRoutingAdapter implements RoutingPort {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number = 2000, // EQ-02: no esperar más de 2 s
  ) {}

  async calcularRuta(origen: Coordenada, destino: Coordenada): Promise<ResultadoRuta> {
    // OSRM espera el orden "longitud,latitud"
    const url =
      `${this.baseUrl}/route/v1/driving/` +
      `${origen.longitud},${origen.latitud};${destino.longitud},${destino.latitud}?overview=false`;

    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), this.timeoutMs);

    try {
      const respuesta = await fetch(url, { signal: controlador.signal });
      if (!respuesta.ok) {
        throw new Error(`OSRM respondió con estado ${respuesta.status}`);
      }
      const datos = (await respuesta.json()) as {
        routes?: { distance: number; duration: number }[];
      };
      const ruta = datos.routes?.[0];
      if (!ruta) {
        throw new Error('OSRM no devolvió ninguna ruta');
      }
      return { distanciaMetros: ruta.distance, duracionSegundos: ruta.duration };
    } finally {
      clearTimeout(temporizador);
    }
  }
}
