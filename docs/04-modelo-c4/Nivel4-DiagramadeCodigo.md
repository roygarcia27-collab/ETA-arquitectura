# Nivel 4: Diagrama de Código

El flujo crítico del sistema es **consultar el ETA de una parada** (equivalente al "confirmar compra" de GoPet).

* **Presentación:**
  * `EtaController`: Recibe `GET /api/v1/paradas/:paradaId/eta?rutaId=...`, valida parámetros y delega al caso de uso. Traduce errores a HTTP (404 / 503).
* **Aplicación:**
  * `ConsultarEtaUseCase`: Orquesta el flujo. Depende solo de contratos abstractos (`ParadasPort`, `PosicionesPort`, `EtaStrategy`).
  * `ConsultarEtaQuery` y `ConsultarEtaResultado`: DTOs de entrada y salida.
* **Dominio:**
  * `PosicionVehiculo` (Entidad): vehículo, ruta, coordenada, velocidad, última parada visitada y marca de tiempo. Sabe si está **vigente**.
  * `Parada` (Entidad): parada de una ruta con su `orden` y coordenada.
  * `Coordenada` (Value Object, inmutable): valida rangos y calcula distancia (Haversine).
  * `EstimacionEta` (Value Object): minutos, método, confianza y momento de cálculo.
  * `EtaStrategy` (Interface / Puerto): contrato `estimar(posicion, parada)`.
  * `EtaPorRuteo`, `EtaPorVelocidadPromedio`, `EtaConRespaldo`: estrategias concretas.
  * `ParadasPort`, `PosicionesPort`, `RoutingPort` (Interfaces / Puertos).
* **Infraestructura:**
  * `OsrmRoutingAdapter`: implementa `RoutingPort` contra la API HTTP de OSRM.
  * `RutasApiAdapter`: implementa `ParadasPort` usando la API pública del módulo Rutas.
  * `SeguimientoApiAdapter`: implementa `PosicionesPort` usando la API pública del módulo Seguimiento.

![Figura 4](../../img/nivel4-clases.png)

> Fuente editable: [`nivel4-clases.puml`](../../img/fuentes-puml/nivel4-clases.puml)

---

## 4.5 Diagrama de Secuencia: Consultar ETA (`GET /api/v1/paradas/{id}/eta`)

Incluye el flujo principal, el **fallback** ante falla del servicio de mapas (EQ-02) y los flujos alternativos.

![Figura 5](../../img/nivel4-secuencia-consultar-eta.png)

> Fuente editable: [`nivel4-secuencia-consultar-eta.puml`](../../img/fuentes-puml/nivel4-secuencia-consultar-eta.puml)

---

## 4.6 Diagrama de Secuencia: Reportar Posición (`POST /api/v1/posiciones`)

Flujo de **ingesta**. Muestra el patrón Observer: la respuesta al conductor no espera las alertas ni la escritura del historial.

![Figura 6](../../img/nivel4-secuencia-reportar-posicion.png)

> Fuente editable: [`nivel4-secuencia-reportar-posicion.puml`](../../img/fuentes-puml/nivel4-secuencia-reportar-posicion.puml)
