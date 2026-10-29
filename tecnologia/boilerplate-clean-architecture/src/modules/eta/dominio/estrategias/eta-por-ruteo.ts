import { EtaStrategy } from '../eta-strategy';
import { RoutingPort } from '../routing-port';
import { PosicionVehiculo } from '../posicion-vehiculo';
import { Parada } from '../parada';
import { EstimacionEta } from '../estimacion-eta';
import { MetodoEstimacion } from '../metodo-estimacion';
import { NivelConfianza } from '../nivel-confianza';

export class EtaPorRuteo implements EtaStrategy {
  constructor(private readonly routingPort: RoutingPort) {}

  async estimar(posicion: PosicionVehiculo, parada: Parada): Promise<EstimacionEta> {
    const ruta = await this.routingPort.calcularRuta(posicion.coordenada, parada.coordenada);
    return EstimacionEta.crear(
      posicion.vehiculoId, parada.id, ruta.duracionSegundos / 60,
      MetodoEstimacion.RUTEO_EXTERNO, NivelConfianza.ALTA,
    );
  }
}
