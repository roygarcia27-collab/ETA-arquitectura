import { Coordenada } from './coordenada';

/** Parada de una ruta concreta, con su posición (orden) dentro del recorrido. */
export class Parada {
  constructor(
    readonly id: string,
    readonly rutaId: string,
    readonly nombre: string,
    readonly orden: number,
    readonly coordenada: Coordenada,
  ) {}
}
