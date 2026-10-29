import { PosicionVehiculo } from './posicion-vehiculo';
import { Parada } from './parada';
import { EstimacionEta } from './estimacion-eta';
export interface EtaStrategy {
  estimar(posicion: PosicionVehiculo, parada: Parada): Promise<EstimacionEta>;
}
