# Componentes Arquitectónicos

Módulos del monolito (contenedor **API ETA**). El diagrama detallado está en [Nivel 3](../04-modelo-c4/Nivel3-Diagrama-de-Componentes.md).

| Módulo | Responsabilidad | Consume (API pública de) | Persistencia |
|---|---|---|---|
| **API REST** (`src/api`) | Enrutamiento, JWT, roles, rate limiting, validación inicial | Todos los módulos | n/a |
| **Usuarios** | Registro, login, roles, emisión de JWT | n/a | PostgreSQL |
| **Empresas** | Empresas y asociaciones de transporte | n/a | PostgreSQL |
| **Rutas** | Rutas, trazados y paradas; lecturas cacheadas | n/a | PostgreSQL + PostGIS, caché Redis |
| **Flota** | Vehículos, conductores, asignaciones y recorridos | Empresas, Rutas | PostgreSQL |
| **Seguimiento** | Ingesta de posiciones, estado SIN_SEÑAL | Flota | Redis (última posición), PostgreSQL (historial por lotes) |
| **ETA** | Cálculo del ETA (Strategy con respaldo) | Rutas, Seguimiento, Servicio de Mapas | Sin tabla propia |
| **Suscripciones** | Favoritos y alertas de proximidad | ETA, Notificaciones (y eventos del Bus) | PostgreSQL |
| **Notificaciones** | Fachada de canales push y correo | Servicio Push (FCM), correo | n/a |
| **Bus de Eventos** | `PosicionActualizada`, `VehiculoSinSenal`, `RecorridoFinalizado` | n/a | Memoria |

## Reglas de interacción modular
1. Los módulos se comunican en memoria **únicamente** a través del `index.ts` público del módulo destino.
2. **Ningún módulo ejecuta SQL sobre tablas de otro módulo.**
3. Los efectos secundarios (alertas, historial) se desacoplan mediante eventos del Bus.
