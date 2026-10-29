# Nivel 3: Diagrama de Componentes

Detalla los bloques modulares del monolito:

* **API REST (`src/api/`):** Enrutamiento Express, autenticación JWT, autorización por rol, *rate limiting* y validación inicial.
* **Módulo Usuarios:** Registro, login, roles (Pasajero, Conductor, Operador, Admin) y emisión de JWT.
* **Módulo Empresas:** Empresas y asociaciones de transporte; relación con operadores.
* **Módulo Rutas:** Rutas, trazados y paradas ordenadas; consultas cacheadas con Decorator + Redis.
* **Módulo Flota:** Vehículos, conductores, asignaciones y **recorridos** (con su máquina de estados).
* **Módulo Seguimiento:** Ingesta de posiciones, almacenamiento de la última posición en Redis y estado SIN_SEÑAL.
* **Módulo ETA:** Cálculo del ETA mediante Strategy con respaldo; integra el Servicio de Mapas.
* **Módulo Suscripciones:** Favoritos y alertas de proximidad (escucha eventos).
* **Módulo Notificaciones:** Fachada de canales (push y correo).
* **Bus de Eventos:** Comunicación asíncrona interna en memoria.

**Reglas de Interacción Modular:**
1. Los módulos se comunican en memoria **únicamente** a través del archivo de entrada público (`index.ts`) del módulo destino.
2. **Ningún módulo puede ejecutar SQL sobre las tablas de otro módulo.** Si ETA necesita datos de una parada, le pregunta a la API pública de Rutas.
3. Los efectos secundarios (alertas, historial) se desacoplan mediante eventos del Bus.

![Figura 3](../../img/nivel3-componentes.png)

> Fuente editable: [`nivel3-componentes.puml`](../../img/fuentes-puml/nivel3-componentes.puml)
