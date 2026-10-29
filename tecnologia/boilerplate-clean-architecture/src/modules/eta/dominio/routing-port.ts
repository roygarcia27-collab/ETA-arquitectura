import { Coordenada } from './coordenada';
export interface ResultadoRuta {
  distanciaMetros: number;
  duracionSegundos: number;
}
export interface RoutingPort {
  calcularRuta(origen: Coordenada, destino: Coordenada): Promise<ResultadoRuta>;
}
