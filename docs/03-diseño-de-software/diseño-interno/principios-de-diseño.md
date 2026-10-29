# Principios de Diseño (SOLID)

* **S - Single Responsibility Principle (Responsabilidad Única):**
  * `EtaController`: solo traduce HTTP $\leftrightarrow$ caso de uso.
  * `ConsultarEtaUseCase`: solo orquesta el flujo de consulta.
  * `PosicionVehiculo`: solo conoce su propia vigencia.
  * `OsrmRoutingAdapter`: solo habla con OSRM.
* **O - Open/Closed Principle (Abierto para extensión, cerrado para modificación):**
  * Para usar Mapbox o añadir un ETA basado en historial real, **no se modifica** `ConsultarEtaUseCase`. Se crea `MapboxRoutingAdapter` o `EtaPorHistorico` implementando el puerto correspondiente.
* **L - Liskov Substitution Principle (Sustitución de Liskov):**
  * `EtaPorRuteo`, `EtaPorVelocidadPromedio` y `EtaConRespaldo` son intercambiables: todas respetan el contrato de `EtaStrategy` y devuelven una `EstimacionEta`. El caso de uso funciona igual con cualquiera.
* **I - Interface Segregation Principle (Segregación de Interfaces):**
  * Los puertos son compactos y específicos: `RoutingPort` solo calcula rutas, `ParadasPort` solo busca paradas, `PosicionesPort` solo lee posiciones vigentes. Ninguno mezcla métodos que el caso de uso no necesita.
* **D - Dependency Inversion Principle (Inversión de Dependencias):**
  * `ConsultarEtaUseCase` **no depende** de `OsrmRoutingAdapter`, de Redis ni de los módulos Rutas/Seguimiento. Todos dependen de abstracciones (`ParadasPort`, `PosicionesPort`, `EtaStrategy`), ensambladas en `eta.module.ts`.

## Inversión de dependencias en el módulo ETA

![Principio DIP](../../../img/principio-dip.png)

> Fuente editable: [`principio-dip.puml`](../../../img/fuentes-puml/principio-dip.puml)

## Paquetes del módulo ETA

![Paquetes del módulo ETA](../../../img/paquetes-modulo-eta.png)

> Fuente editable: [`paquetes-modulo-eta.puml`](../../../img/fuentes-puml/paquetes-modulo-eta.puml)
