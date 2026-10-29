export class Coordenada {
  constructor(readonly latitud: number, readonly longitud: number) {
    if (!Number.isFinite(latitud) || latitud < -90 || latitud > 90) {
      throw new Error('RN-01: La latitud debe estar entre -90 y 90');
    }
    if (!Number.isFinite(longitud) || longitud < -180 || longitud > 180) {
      throw new Error('RN-01: La longitud debe estar entre -180 y 180');
    }
  }

  /** Distancia en metros por la fórmula de Haversine. */
  distanciaMetrosA(otra: Coordenada): number {
    const RADIO_TIERRA_M = 6_371_000;
    const aRad = (grados: number) => (grados * Math.PI) / 180;
    const dLat = aRad(otra.latitud - this.latitud);
    const dLon = aRad(otra.longitud - this.longitud);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(aRad(this.latitud)) * Math.cos(aRad(otra.latitud)) * Math.sin(dLon / 2) ** 2;
    return 2 * RADIO_TIERRA_M * Math.asin(Math.sqrt(a));
  }
}
