import { Coordenada } from './coordenada';

export class PosicionVehiculo {
  constructor(
    readonly vehiculoId: string,
    readonly rutaId: string,
    readonly coordenada: Coordenada,
    readonly velocidadKmh: number,
    readonly ultimaParadaOrden: number,
    readonly registradaEn: Date,
  ) {}

  antiguedadSegundos(ahora: Date = new Date()): number {
    return (ahora.getTime() - this.registradaEn.getTime()) / 1000;
  }

  /** RN-03: una posición es vigente si no supera el TTL. */
  estaVigente(ttlSegundos: number, ahora: Date = new Date()): boolean {
    return this.antiguedadSegundos(ahora) <= ttlSegundos;
  }
}
