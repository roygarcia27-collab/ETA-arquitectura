import { EtaStrategy } from '../eta-strategy';
import { PosicionVehiculo } from '../posicion-vehiculo';
import { Parada } from '../parada';
import { EstimacionEta } from '../estimacion-eta';
import { MetodoEstimacion } from '../metodo-estimacion';
import { NivelConfianza } from '../nivel-confianza';

export class EtaPorVelocidadPromedio implements EtaStrategy {
  constructor(
    private readonly velocidadPromedioKmh: number = 15, // calibrar con datos reales
    private readonly factorRodeo: number = 1.3,         // la calle no es línea recta
  ) {}

  async estimar(posicion: PosicionVehiculo, parada: Parada): Promise<EstimacionEta> {
    const metros = posicion.coordenada.distanciaMetrosA(parada.coordenada) * this.factorRodeo;
    const metrosPorMinuto = (this.velocidadPromedioKmh * 1000) / 60;
    return EstimacionEta.crear(
      posicion.vehiculoId, parada.id, metros / metrosPorMinuto,
      MetodoEstimacion.VELOCIDAD_PROMEDIO, NivelConfianza.BAJA,
    );
  }
}
