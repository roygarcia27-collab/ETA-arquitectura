// API pública del módulo Rutas.
// TODO: reemplazar la versión en memoria por la real (PostgreSQL + PostGIS,
// con CachedRutaRepository sobre Redis, según ADR-003).

export interface ParadaDTO {
  id: string;
  rutaId: string;
  nombre: string;
  orden: number;
  latitud: number;
  longitud: number;
}

export interface RutasApi {
  obtenerParada(paradaId: string): Promise<ParadaDTO | null>;
}

export const RUTA_DEMO_ID = 'ruta-demo';

// Coordenadas de EJEMPLO: reemplazar por paradas reales de Ayacucho.
const PARADAS_DEMO: ParadaDTO[] = [
  { id: 'parada-1', rutaId: RUTA_DEMO_ID, nombre: 'Parada 1 (ejemplo)', orden: 1, latitud: -13.1588, longitud: -74.2300 },
  { id: 'parada-2', rutaId: RUTA_DEMO_ID, nombre: 'Parada 2 (ejemplo)', orden: 2, latitud: -13.1588, longitud: -74.2260 },
  { id: 'parada-3', rutaId: RUTA_DEMO_ID, nombre: 'Parada 3 (ejemplo)', orden: 3, latitud: -13.1588, longitud: -74.2220 },
  { id: 'parada-4', rutaId: RUTA_DEMO_ID, nombre: 'Parada 4 (ejemplo)', orden: 4, latitud: -13.1588, longitud: -74.2180 },
];

export function crearRutasApiEnMemoria(): RutasApi {
  return {
    async obtenerParada(paradaId: string): Promise<ParadaDTO | null> {
      return PARADAS_DEMO.find((p) => p.id === paradaId) ?? null;
    },
  };
}
