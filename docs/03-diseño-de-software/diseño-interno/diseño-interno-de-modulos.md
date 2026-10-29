# Diseño Interno de Módulos

## 5.1 Estructura del Proyecto y de cada Módulo (Clean Architecture)

### Estructura general

```text
eta-ayacucho/
├── apps/
│   ├── web-pasajero/            # Angular PWA (mapa, ETA, favoritos)
│   ├── web-conductor/           # Angular PWA (geolocalización, búfer offline)
│   └── web-gestion/             # Angular (operador y administrador)
├── backend/
│   ├── src/
│   │   ├── api/                 # Express: rutas, middleware JWT/roles, rate limiting
│   │   ├── shared/              # event-bus, errores base, configuración
│   │   ├── modules/
│   │   │   ├── usuarios/
│   │   │   ├── empresas/
│   │   │   ├── rutas/
│   │   │   ├── flota/
│   │   │   ├── seguimiento/
│   │   │   ├── eta/
│   │   │   ├── suscripciones/
│   │   │   └── notificaciones/
│   │   └── app.ts               # Raíz de composición global
│   └── tests/
├── docker-compose.yml           # api + postgres(postgis) + redis
└── .github/workflows/ci.yml     # Integración continua
```

### Estructura estandarizada de un módulo (ejemplo: `eta`)

```text
src/modules/eta/
├── dominio/                              # Capa central: cero dependencias externas
│   ├── coordenada.ts                     # Value Object (valida y calcula distancia)
│   ├── parada.ts                         # Entidad
│   ├── posicion-vehiculo.ts              # Entidad
│   ├── estimacion-eta.ts                 # Value Object
│   ├── metodo-estimacion.ts              # Enum
│   ├── nivel-confianza.ts                # Enum
│   ├── errores.ts                        # Errores de dominio
│   ├── paradas-port.ts                   # Puerto
│   ├── posiciones-port.ts                # Puerto
│   ├── routing-port.ts                   # Puerto
│   ├── eta-strategy.ts                   # Puerto / contrato Strategy
│   └── estrategias/
│       ├── eta-por-ruteo.ts
│       ├── eta-por-velocidad-promedio.ts
│       └── eta-con-respaldo.ts
├── aplicacion/                           # Casos de uso: orquestación pura
│   ├── consultar-eta.use-case.ts
│   ├── consultar-eta.query.ts
│   └── consultar-eta.resultado.ts
├── infraestructura/                      # Adaptadores técnicos
│   ├── osrm-routing.adapter.ts           # Implementa RoutingPort
│   ├── mapbox-routing.adapter.ts         # (alternativo) Implementa RoutingPort
│   ├── rutas-api.adapter.ts              # Implementa ParadasPort vía API pública de Rutas
│   └── seguimiento-api.adapter.ts        # Implementa PosicionesPort vía API pública de Seguimiento
├── presentacion/                         # Punto de entrada HTTP
│   ├── eta.controller.ts
│   └── eta.routes.ts
├── eta.module.ts                         # Composition Root (inyección de dependencias)
└── index.ts                              # API pública del módulo hacia el resto del sistema
```

---

## 5.2 Contrato de la API REST (resumen)

| Método y ruta | Acceso | Descripción | RF |
|---|---|---|:---:|
| `POST /api/v1/auth/register` · `POST /api/v1/auth/login` | Público | Registro e inicio de sesión (devuelve JWT) | RF11 |
| `GET /api/v1/rutas` | Público | Lista de rutas activas | RF01 |
| `GET /api/v1/rutas/:rutaId/paradas` | Público | Paradas ordenadas de una ruta | RF01 |
| `GET /api/v1/paradas/cercanas?lat=&lng=&radio=` | Público | Paradas a menos de `radio` metros | RF01 |
| `GET /api/v1/paradas/:paradaId/eta?rutaId=` | Público | ETA de los próximos vehículos a la parada | RF02 |
| `GET /api/v1/rutas/:rutaId/vehiculos` | Público | Posiciones vigentes de la ruta (mapa) | RF03 |
| `POST /api/v1/recorridos` | Conductor | Inicia un recorrido | RF04 |
| `PATCH /api/v1/recorridos/:id/finalizar` | Conductor | Finaliza el recorrido | RF04 |
| `POST /api/v1/posiciones` | Conductor | Reporta una posición (acepta arreglo para envío en lote) | RF05 |
| `GET/POST/PUT/DELETE /api/v1/vehiculos` · `/conductores` | Operador | Gestión de flota y asignaciones | RF06 |
| `GET/POST/PUT/DELETE /api/v1/empresas` · `/rutas` · `/paradas` | Administrador | Gestión de la red de transporte | RF07 |
| `GET/POST/DELETE /api/v1/favoritos` | Pasajero | Paradas favoritas | RF08 |
| `POST /api/v1/alertas` | Pasajero | Crea alerta de proximidad (parada + umbral en minutos) | RF09 |
| `GET /api/v1/reportes/puntualidad` | Operador | Reporte de puntualidad | RF10 |

**Ejemplo de respuesta de `GET /api/v1/paradas/{id}/eta?rutaId={rutaId}`:**

```json
{
  "paradaId": "b1f0c0de-0000-4000-8000-000000000001",
  "paradaNombre": "Nombre de la parada",
  "vehiculos": [
    {
      "vehiculoId": "a7c2e1aa-0000-4000-8000-000000000002",
      "minutos": 4,
      "metodo": "RUTEO_EXTERNO",
      "confianza": "ALTA",
      "calculadaEn": "2026-10-21T15:04:05.000Z"
    }
  ]
}
```

---

## 5.3 Reglas de Negocio (RN)

| ID | Regla |
|---|---|
| **RN-01** | Toda coordenada debe tener latitud en [-90, 90] y longitud en [-180, 180]. |
| **RN-02** | El ETA nunca es negativo y se expresa en minutos enteros redondeados hacia arriba. |
| **RN-03** | Solo se usan posiciones **vigentes** (antigüedad ≤ 60 s). Las demás se descartan (vehículo SIN_SEÑAL). |
| **RN-04** | Solo entran al cálculo los vehículos que **aún no han pasado** la parada (`ultimaParadaOrden < parada.orden`). |
| **RN-05** | Un conductor solo puede tener **un** recorrido EN_CURSO a la vez. |
| **RN-06** | Un vehículo solo puede iniciar recorrido en una ruta que su empresa tenga asignada. |
| **RN-07** | Un recorrido FINALIZADO o CANCELADO no puede reabrirse. |
| **RN-08** | La parada consultada debe existir y pertenecer a la ruta indicada. |
| **RN-09** | Cada consulta devuelve como máximo 3 vehículos (configurable). |

---

## 5.4 Modelo de Datos (PostgreSQL + PostGIS)

Cada módulo es dueño de sus tablas; las relaciones entre módulos se resuelven por identificador a través de las APIs públicas, no por consultas cruzadas.

![Figura 7](../../../img/modelo-datos.png)

> Fuente editable: [`modelo-datos.puml`](../../../img/fuentes-puml/modelo-datos.puml)

> **Notas de diseño:** `posicion_historial` crece rápido (≈ 12 filas/min por vehículo activo), por lo que conviene **particionarla por fecha** y escribirla por lotes. Índices GiST sobre `parada_ruta.ubicacion` y `ruta.trazado` para las consultas espaciales (`ST_DWithin`).

---

## 5.5 Máquina de Estados del Recorrido

![Figura 8](../../../img/estados-recorrido.png)

> Fuente editable: [`estados-recorrido.puml`](../../../img/fuentes-puml/estados-recorrido.puml)

---

## 5.6 Implementación de Referencia en TypeScript (Módulo ETA)

### Capa de Dominio: Value Object `Coordenada` (`dominio/coordenada.ts`)
```typescript
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
```

### Capa de Dominio: Entidades y Value Objects
```typescript
// dominio/parada.ts
import { Coordenada } from './coordenada';

/** Parada de una ruta concreta, con su posición (orden) dentro del recorrido. */
export class Parada {
  constructor(
    readonly id: string,
    readonly rutaId: string,
    readonly nombre: string,
    readonly orden: number,
    readonly coordenada: Coordenada,
  ) {}
}

// dominio/posicion-vehiculo.ts
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

// dominio/metodo-estimacion.ts
export enum MetodoEstimacion {
  RUTEO_EXTERNO = 'RUTEO_EXTERNO',
  VELOCIDAD_PROMEDIO = 'VELOCIDAD_PROMEDIO',
}

// dominio/nivel-confianza.ts
export enum NivelConfianza {
  ALTA = 'ALTA',
  MEDIA = 'MEDIA',
  BAJA = 'BAJA',
}

// dominio/estimacion-eta.ts
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

// dominio/errores.ts
export class ParadaNoEncontradaError extends Error {
  constructor(paradaId: string) {
    super(`RN-08: La parada ${paradaId} no existe en la ruta indicada`);
    this.name = 'ParadaNoEncontradaError';
  }
}
```

### Puertos del Dominio
```typescript
// dominio/paradas-port.ts
import { Parada } from './parada';
export interface ParadasPort {
  buscarPorId(paradaId: string): Promise<Parada | null>;
}

// dominio/posiciones-port.ts
import { PosicionVehiculo } from './posicion-vehiculo';
export interface PosicionesPort {
  obtenerVigentesPorRuta(rutaId: string): Promise<PosicionVehiculo[]>;
}

// dominio/routing-port.ts
import { Coordenada } from './coordenada';
export interface ResultadoRuta {
  distanciaMetros: number;
  duracionSegundos: number;
}
export interface RoutingPort {
  calcularRuta(origen: Coordenada, destino: Coordenada): Promise<ResultadoRuta>;
}

// dominio/eta-strategy.ts
import { PosicionVehiculo } from './posicion-vehiculo';
import { Parada } from './parada';
import { EstimacionEta } from './estimacion-eta';
export interface EtaStrategy {
  estimar(posicion: PosicionVehiculo, parada: Parada): Promise<EstimacionEta>;
}
```

### Patrón Strategy: estrategias de cálculo (`dominio/estrategias/`)
```typescript
// eta-por-velocidad-promedio.ts  (estrategia de respaldo, sin red)
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

// eta-por-ruteo.ts  (estrategia principal, usa el servicio de mapas vía puerto)
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

// eta-con-respaldo.ts  (cumple EQ-02: degradación elegante)
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
```

### Capa de Aplicación (`aplicacion/consultar-eta.use-case.ts`)
```typescript
import { ParadasPort } from '../dominio/paradas-port';
import { PosicionesPort } from '../dominio/posiciones-port';
import { EtaStrategy } from '../dominio/eta-strategy';
import { ParadaNoEncontradaError } from '../dominio/errores';

export interface ConsultarEtaQuery {
  paradaId: string;
  rutaId: string;
}

export interface EtaVehiculoDTO {
  vehiculoId: string;
  minutos: number;
  metodo: string;
  confianza: string;
  calculadaEn: string;
}

export interface ConsultarEtaResultado {
  paradaId: string;
  paradaNombre: string;
  vehiculos: EtaVehiculoDTO[];
}

export class ConsultarEtaUseCase {
  constructor(
    private readonly paradasPort: ParadasPort,         // Interfaz, no clase concreta
    private readonly posicionesPort: PosicionesPort,   // Interfaz, no Redis
    private readonly etaStrategy: EtaStrategy,         // Interfaz, no proveedor de mapas
    private readonly ttlPosicionSegundos: number = 60,
    private readonly maxResultados: number = 3,
  ) {}

  async ejecutar(query: ConsultarEtaQuery): Promise<ConsultarEtaResultado> {
    // 1. RN-08: la parada debe existir y pertenecer a la ruta
    const parada = await this.paradasPort.buscarPorId(query.paradaId);
    if (!parada || parada.rutaId !== query.rutaId) {
      throw new ParadaNoEncontradaError(query.paradaId);
    }

    // 2. Posiciones en vivo de la ruta
    const posiciones = await this.posicionesPort.obtenerVigentesPorRuta(query.rutaId);

    // 3. RN-03 y RN-04: solo vehículos vigentes que aún no pasaron la parada
    const candidatas = posiciones.filter(
      (p) => p.estaVigente(this.ttlPosicionSegundos) && p.ultimaParadaOrden < parada.orden,
    );

    // 4. Estimación en paralelo mediante la estrategia inyectada
    const estimaciones = await Promise.all(
      candidatas.map((p) => this.etaStrategy.estimar(p, parada)),
    );

    // 5. RN-09: los más cercanos en tiempo, hasta el máximo configurado
    const vehiculos = estimaciones
      .sort((a, b) => a.minutos - b.minutos)
      .slice(0, this.maxResultados)
      .map((e) => ({
        vehiculoId: e.vehiculoId,
        minutos: e.minutos,
        metodo: e.metodo,
        confianza: e.confianza,
        calculadaEn: e.calculadaEn.toISOString(),
      }));

    return { paradaId: parada.id, paradaNombre: parada.nombre, vehiculos };
  }
}
```

### Capa de Infraestructura: Adaptador del Servicio de Mapas (`infraestructura/osrm-routing.adapter.ts`)
```typescript
import { RoutingPort, ResultadoRuta } from '../dominio/routing-port';
import { Coordenada } from '../dominio/coordenada';

export class OsrmRoutingAdapter implements RoutingPort {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number = 2000, // EQ-02: no esperar más de 2 s
  ) {}

  async calcularRuta(origen: Coordenada, destino: Coordenada): Promise<ResultadoRuta> {
    // OSRM espera el orden "longitud,latitud"
    const url =
      `${this.baseUrl}/route/v1/driving/` +
      `${origen.longitud},${origen.latitud};${destino.longitud},${destino.latitud}?overview=false`;

    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), this.timeoutMs);

    try {
      const respuesta = await fetch(url, { signal: controlador.signal });
      if (!respuesta.ok) {
        throw new Error(`OSRM respondió con estado ${respuesta.status}`);
      }
      const datos = (await respuesta.json()) as {
        routes?: { distance: number; duration: number }[];
      };
      const ruta = datos.routes?.[0];
      if (!ruta) {
        throw new Error('OSRM no devolvió ninguna ruta');
      }
      return { distanciaMetros: ruta.distance, duracionSegundos: ruta.duration };
    } finally {
      clearTimeout(temporizador);
    }
  }
}
```

### Capa de Infraestructura: Adaptadores hacia otros módulos (anti-corrupción)
```typescript
// infraestructura/rutas-api.adapter.ts
import { ParadasPort } from '../dominio/paradas-port';
import { Parada } from '../dominio/parada';
import { Coordenada } from '../dominio/coordenada';
import type { RutasApi } from '../../rutas'; // API pública (index.ts) del módulo Rutas

export class RutasApiAdapter implements ParadasPort {
  constructor(private readonly rutasApi: RutasApi) {}

  async buscarPorId(paradaId: string): Promise<Parada | null> {
    const dto = await this.rutasApi.obtenerParada(paradaId);
    if (!dto) return null;
    // Se traduce el DTO del otro módulo a NUESTRO modelo de dominio
    return new Parada(dto.id, dto.rutaId, dto.nombre, dto.orden, new Coordenada(dto.latitud, dto.longitud));
  }
}

// infraestructura/seguimiento-api.adapter.ts
import { PosicionesPort } from '../dominio/posiciones-port';
import { PosicionVehiculo } from '../dominio/posicion-vehiculo';
import { Coordenada } from '../dominio/coordenada';
import type { SeguimientoApi } from '../../seguimiento'; // API pública del módulo Seguimiento

export class SeguimientoApiAdapter implements PosicionesPort {
  constructor(private readonly seguimientoApi: SeguimientoApi) {}

  async obtenerVigentesPorRuta(rutaId: string): Promise<PosicionVehiculo[]> {
    const dtos = await this.seguimientoApi.obtenerPosicionesVigentes(rutaId);
    return dtos.map(
      (d) =>
        new PosicionVehiculo(
          d.vehiculoId, d.rutaId, new Coordenada(d.latitud, d.longitud),
          d.velocidadKmh, d.ultimaParadaOrden, new Date(d.registradaEn),
        ),
    );
  }
}
```

### Capa de Presentación (`presentacion/eta.controller.ts`)
```typescript
import { Request, Response } from 'express';
import { ConsultarEtaUseCase } from '../aplicacion/consultar-eta.use-case';
import { ParadaNoEncontradaError } from '../dominio/errores';

export class EtaController {
  constructor(private readonly consultarEta: ConsultarEtaUseCase) {}

  obtenerEta = async (req: Request, res: Response): Promise<void> => {
    const rutaId = typeof req.query.rutaId === 'string' ? req.query.rutaId : '';
    if (!rutaId) {
      res.status(400).json({ mensaje: 'El parámetro rutaId es obligatorio' });
      return;
    }

    try {
      const resultado = await this.consultarEta.ejecutar({
        paradaId: req.params.paradaId,
        rutaId,
      });
      res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof ParadaNoEncontradaError) {
        res.status(404).json({ mensaje: error.message });
        return;
      }
      // Sin trazas internas hacia el cliente (EQ-03)
      res.status(503).json({ mensaje: 'Servicio de estimación temporalmente no disponible' });
    }
  };
}
```

### Raíz de Composición del Módulo (`eta.module.ts`)
```typescript
import type { RutasApi } from '../rutas';
import type { SeguimientoApi } from '../seguimiento';
import { OsrmRoutingAdapter } from './infraestructura/osrm-routing.adapter';
import { RutasApiAdapter } from './infraestructura/rutas-api.adapter';
import { SeguimientoApiAdapter } from './infraestructura/seguimiento-api.adapter';
import { EtaPorRuteo } from './dominio/estrategias/eta-por-ruteo';
import { EtaPorVelocidadPromedio } from './dominio/estrategias/eta-por-velocidad-promedio';
import { EtaConRespaldo } from './dominio/estrategias/eta-con-respaldo';
import { ConsultarEtaUseCase } from './aplicacion/consultar-eta.use-case';
import { EtaController } from './presentacion/eta.controller';

interface DependenciasEta {
  rutasApi: RutasApi;               // API pública del módulo Rutas
  seguimientoApi: SeguimientoApi;   // API pública del módulo Seguimiento
  osrmBaseUrl: string;
}

export function inicializarModuloEta(deps: DependenciasEta) {
  // Adaptadores de infraestructura
  const paradasPort = new RutasApiAdapter(deps.rutasApi);
  const posicionesPort = new SeguimientoApiAdapter(deps.seguimientoApi);
  const routingPort = new OsrmRoutingAdapter(deps.osrmBaseUrl);

  // Estrategia principal con respaldo automático
  const estrategia = new EtaConRespaldo(
    new EtaPorRuteo(routingPort),
    new EtaPorVelocidadPromedio(15),
  );

  // Inyección de dependencias en el caso de uso y el controlador
  const consultarEtaUseCase = new ConsultarEtaUseCase(paradasPort, posicionesPort, estrategia);
  const etaController = new EtaController(consultarEtaUseCase);

  return {
    etaController,
    // Se expone el caso de uso para que Suscripciones pueda pedir ETAs internamente
    consultarEtaUseCase,
  };
}
```

### Ensamblaje global (`src/app.ts`, fragmento ilustrativo)
```typescript
const rutas = inicializarModuloRutas(dbPool, redis);
const flota = inicializarModuloFlota(dbPool);
const seguimiento = inicializarModuloSeguimiento({ redis, eventBus, flotaApi: flota.api });
const eta = inicializarModuloEta({
  rutasApi: rutas.api,
  seguimientoApi: seguimiento.api,
  osrmBaseUrl: process.env.OSRM_URL!,
});

app.get('/api/v1/paradas/:paradaId/eta', eta.etaController.obtenerEta);
```
