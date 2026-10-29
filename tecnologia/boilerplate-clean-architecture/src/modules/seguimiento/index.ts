// API pública del módulo Seguimiento.
// TODO: reemplazar la versión en memoria por la real (Redis con TTL de 60 s, ADR-003).

export interface PosicionDTO {
  vehiculoId: string;
  rutaId: string;
  latitud: number;
  longitud: number;
  velocidadKmh: number;
  ultimaParadaOrden: number;
  registradaEn: string; // ISO 8601
}

export interface SeguimientoApi {
  obtenerPosicionesVigentes(rutaId: string): Promise<PosicionDTO[]>;
}

// Datos de EJEMPLO para ver funcionar el ETA sin Redis ni conductores reales.
export function crearSeguimientoApiEnMemoria(): SeguimientoApi {
  return {
    async obtenerPosicionesVigentes(rutaId: string): Promise<PosicionDTO[]> {
      if (rutaId !== 'ruta-demo') return [];
      const ahora = new Date();
      const hace5min = new Date(ahora.getTime() - 5 * 60 * 1000);
      const base = { rutaId, latitud: -13.1588, velocidadKmh: 15 };
      return [
        { ...base, vehiculoId: 'vehiculo-A', longitud: -74.2262, ultimaParadaOrden: 1, registradaEn: ahora.toISOString() },
        { ...base, vehiculoId: 'vehiculo-B', longitud: -74.2300, ultimaParadaOrden: 0, registradaEn: ahora.toISOString() },
        // Ya pasó la parada 3 (RN-04): no debe aparecer en el ETA de la parada 3
        { ...base, vehiculoId: 'vehiculo-C', longitud: -74.2180, ultimaParadaOrden: 3, registradaEn: ahora.toISOString() },
        // Posición vencida (RN-03): sin señal hace 5 minutos
        { ...base, vehiculoId: 'vehiculo-D', longitud: -74.2240, ultimaParadaOrden: 2, registradaEn: hace5min.toISOString() },
      ];
    },
  };
}
