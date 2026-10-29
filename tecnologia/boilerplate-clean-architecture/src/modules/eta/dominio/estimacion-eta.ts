import { MetodoEstimacion } from './metodo-estimacion';
import { NivelConfianza } from './nivel-confianza';

export class EstimacionEta {
  private constructor(
    readonly vehiculoId: string,
    readonly paradaId: string,
    readonly minutos: number,
    readonly metodo: MetodoEstimacion,
    readonly confianza: NivelConfianza,
    readonly calculadaEn: Date,
  ) {}

  static crear(
    vehiculoId: string,
    paradaId: string,
    minutosCrudos: number,
    metodo: MetodoEstimacion,
    confianza: NivelConfianza,
  ): EstimacionEta {
    if (!Number.isFinite(minutosCrudos)) {
      throw new Error('RN-02: El ETA calculado no es un número válido');
    }
    // RN-02: nunca negativo, redondeado hacia arriba
    const minutos = Math.max(0, Math.ceil(minutosCrudos));
    return new EstimacionEta(vehiculoId, paradaId, minutos, metodo, confianza, new Date());
  }
}
