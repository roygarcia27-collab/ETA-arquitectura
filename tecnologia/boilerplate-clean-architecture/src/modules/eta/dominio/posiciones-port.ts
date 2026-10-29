import { PosicionVehiculo } from './posicion-vehiculo';
export interface PosicionesPort {
  obtenerVigentesPorRuta(rutaId: string): Promise<PosicionVehiculo[]>;
}
