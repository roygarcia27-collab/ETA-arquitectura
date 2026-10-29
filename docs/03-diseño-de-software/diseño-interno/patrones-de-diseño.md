# Patrones de Diseño

| Patrón | Dónde se Aplica | Problema que Resuelve | Implementación en Código |
|---|---|---|---|
| **Strategy (Estrategia)** | `ETA -> Cálculo de tiempo` | Existen varias formas de estimar el ETA (ruteo externo, velocidad promedio, histórico) y deben poder intercambiarse sin tocar el caso de uso. | `EtaStrategy` con `EtaPorRuteo`, `EtaPorVelocidadPromedio` y `EtaConRespaldo`. |
| **Adapter (Adaptador)** | `ETA -> Servicio de Mapas`, `Notificaciones -> FCM` | Los servicios externos tienen APIs incompatibles con nuestro modelo y pueden cambiar. | `RoutingPort` como Target; `OsrmRoutingAdapter` traduce `calcularRuta()` a la API HTTP de OSRM. Equivalentes: `MapboxRoutingAdapter`, `FcmPushAdapter`. |
| **Repository (Repositorio)** | `Módulos -> Base de Datos` | Desacopla las reglas de negocio del SQL o del ORM. | `RutaRepository` define el contrato; `PostgresRutaRepository` ejecuta las consultas con PostGIS. |
| **Decorator (Decorador)** | `Rutas -> Caché Redis` | Agrega caché transparente a las lecturas de rutas/paradas sin contaminar el repositorio SQL. | `CachedRutaRepository` envuelve a `PostgresRutaRepository`, consultando primero Redis. |
| **Observer (Observador)** | `Seguimiento -> Suscripciones / Historial` | Al llegar una posición hay efectos secundarios (alertas, historial) que no deben acoplarse ni retrasar la respuesta. | Seguimiento publica `PosicionActualizada` en el `EventBus`; `AlertasHandler` y `HistorialWriter` reaccionan. |
| **Facade (Fachada)** | `Notificaciones -> Canales` | Enviar una alerta implica elegir canal, armar la plantilla, enviar y registrar el resultado. | `NotificacionFacade.alertarProximidad(suscripcion, eta)` coordina las sub-operaciones. |
| **Factory (Fábrica)** | `Seguimiento -> PosicionVehiculo` | Construir una posición exige validar coordenadas, normalizar la marca de tiempo y derivar la última parada visitada. | `PosicionFactory.desdeReporte(dto, recorrido)` encapsula la creación segura. |

## Diagramas de los patrones

### Strategy: cálculo de ETA
![Strategy](../../../img/patron-strategy.png)

> Fuente editable: [`patron-strategy.puml`](../../../img/fuentes-puml/patron-strategy.puml)

### Adapter: servicio de mapas
![Adapter](../../../img/patron-adapter.png)

> Fuente editable: [`patron-adapter.puml`](../../../img/fuentes-puml/patron-adapter.puml)

### Observer: posición actualizada
![Observer](../../../img/patron-observer.png)

> Fuente editable: [`patron-observer.puml`](../../../img/fuentes-puml/patron-observer.puml)

### Facade: notificaciones
![Facade](../../../img/patron-facade.png)

> Fuente editable: [`patron-facade.puml`](../../../img/fuentes-puml/patron-facade.puml)

### Factory: creación de posiciones
![Factory](../../../img/patron-factory.png)

> Fuente editable: [`patron-factory.puml`](../../../img/fuentes-puml/patron-factory.puml)
