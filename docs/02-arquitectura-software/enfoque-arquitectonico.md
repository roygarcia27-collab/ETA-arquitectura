# Enfoque Arquitectónico: Clean Architecture
* **Contexto:** Las reglas de negocio (vigencia de posiciones, filtrado de vehículos que ya pasaron la parada, cálculo de ETA, estados del recorrido) son el activo principal y no deben cambiar si cambia el framework, la BD o el proveedor de mapas.
* **Decisión:** Cada módulo organiza su código en cuatro capas: **Dominio**, **Aplicación**, **Infraestructura** y **Presentación**.
* **Consecuencias Positivas:** Dominio testeable sin base de datos ni red; inversión de dependencias nativa.
* **Consecuencias Negativas:** Más archivos y clases intermedias (DTOs, puertos, mapeadores).

## Capas de cada módulo

| Capa | Contiene | Depende de |
|---|---|---|
| **Dominio** | Entidades, Value Objects, reglas de negocio, puertos (interfaces) y estrategias | Nada externo |
| **Aplicación** | Casos de uso, DTOs de entrada/salida | Dominio |
| **Infraestructura** | Adaptadores: OSRM, Redis, PostgreSQL, adaptadores hacia otros módulos | Dominio (implementa sus puertos) |
| **Presentación** | Controladores Express y rutas | Aplicación |

**Regla de dependencia:** el código fuente solo puede apuntar hacia adentro (hacia el dominio). Nada del dominio conoce Express, Redis, PostgreSQL ni el proveedor de mapas.

![Arquitectura limpia](../../img/arquitectura-limpia.png)

> Fuente editable: [`arquitectura-limpia.puml`](../../img/fuentes-puml/arquitectura-limpia.puml)
