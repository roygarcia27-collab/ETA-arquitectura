import { EtaStrategy } from '../eta-strategy';
import { PosicionVehiculo } from '../posicion-vehiculo';
import { Parada } from '../parada';
import { EstimacionEta } from '../estimacion-eta';

export class EtaConRespaldo implements EtaStrategy {
  constructor(
    private readonly principal: EtaStrategy,
    private readonly respaldo: EtaStrategy,
  ) {}

  async estimar(posicion: PosicionVehiculo, parada: Parada): Promise<EstimacionEta> {
    try {
      return await this.principal.estimar(posicion, parada);
    } catch {
      // Aquí se registraría un warning (observabilidad) y se continúa con el respaldo
      return this.respaldo.estimar(posicion, parada);
    }
  }
}
