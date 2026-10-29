# Decisiones Arquitectónicas (ADRs)

## ADR-001: Estilo de Monolito Modular
* **Contexto:** Proyecto con equipo reducido, plazos académicos acotados y una flota inicial pequeña. Los microservicios añaden complejidad de despliegue, red y monitoreo que no se justifica.
* **Decisión:** Implementar un **Monolito Modular** en Node.js + Express con módulos de límites claros (Usuarios, Empresas, Rutas, Flota, Seguimiento, ETA, Suscripciones, Notificaciones), tablas separadas por módulo y comunicación interna en memoria mediante la API pública (`index.ts`) de cada módulo.
* **Consecuencias Positivas:** Un solo despliegue, simplicidad operativa y camino abierto para extraer **Seguimiento** como servicio independiente si la ingesta crece.
* **Consecuencias Negativas:** Exige disciplina para no cruzar límites modulares ni consultar tablas de otro módulo.

## ADR-002: Enfoque Interno con Clean Architecture
* **Contexto:** Las reglas de negocio (vigencia de posiciones, filtrado de vehículos que ya pasaron la parada, cálculo de ETA, estados del recorrido) son el activo principal y no deben cambiar si cambia el framework, la BD o el proveedor de mapas.
* **Decisión:** Cada módulo organiza su código en cuatro capas: **Dominio**, **Aplicación**, **Infraestructura** y **Presentación**.
* **Consecuencias Positivas:** Dominio testeable sin base de datos ni red; inversión de dependencias nativa.
* **Consecuencias Negativas:** Más archivos y clases intermedias (DTOs, puertos, mapeadores).

## ADR-003: Redis para posiciones en vivo y caché de rutas
* **Contexto:** Las posiciones cambian cada 5 s y solo interesa la **última** de cada vehículo; escribir cada una en PostgreSQL para luego leerla sería ineficiente. Además, rutas y paradas casi no cambian y se leen constantemente.
* **Decisión:** Usar Redis con dos roles: (1) almacén de la última posición por vehículo con **TTL de 60 s**; (2) caché de rutas y paradas mediante el patrón **Decorator** sobre el repositorio de Rutas (`CachedRutaRepository`).
* **Consecuencias Positivas:** Lecturas en memoria de baja latencia; el TTL implementa de forma natural el estado SIN_SEÑAL.
* **Consecuencias Negativas:** Requiere invalidar el caché cuando el administrador edita rutas o paradas; Redis pasa a ser un componente crítico a monitorear.

## ADR-004: Desacoplamiento del Servicio de Mapas mediante Puertos y Adaptadores
* **Contexto:** El proveedor de ruteo puede cambiar por costo o disponibilidad (OSRM autoalojado, Mapbox, Google). Además, puede fallar o responder lento.
* **Decisión:** Definir `RoutingPort` en el dominio del módulo ETA e implementarlo en `OsrmRoutingAdapter` (infraestructura), con *timeout* de 2 s. Combinar la estrategia principal con una de respaldo (`EtaConRespaldo`).
* **Consecuencias Positivas:** Cambiar de proveedor solo requiere un nuevo adaptador; el fallo del proveedor no se propaga al pasajero.
* **Consecuencias Negativas:** El ETA de respaldo es menos preciso (confianza BAJA).

## ADR-005: Geolocalización mediante PWA del Conductor
* **Contexto:** No existe una flota con GPS dedicado y el costo de instalarlo es alto para el MVP; los conductores ya tienen celular con GPS.
* **Decisión:** Una PWA del conductor que usa la *Geolocation API*, envía la posición cada 5 s, mantiene un búfer offline en IndexedDB y usa la *Screen Wake Lock API* para evitar que la pantalla se apague.
* **Consecuencias Positivas:** Costo de hardware cero, despliegue inmediato.
* **Consecuencias Negativas:** Los navegadores limitan la geolocalización en segundo plano, por lo que el conductor debe mantener la app abierta; consume batería. Mitigación futura: aceptar trackers GPS dedicados enviando al mismo endpoint, sin cambiar el dominio.

## ADR-006: PostgreSQL con PostGIS
* **Contexto:** Se requieren consultas espaciales ("paradas a menos de 500 m") y almacenar trazados de ruta.
* **Decisión:** PostgreSQL con PostGIS, columnas `geography(Point)` y `geography(LineString)` con índices GiST.
* **Consecuencias Positivas:** Consultas espaciales eficientes y estándar; una sola base para datos relacionales y geográficos.
* **Consecuencias Negativas:** Mayor curva de aprendizaje y extensión adicional por instalar.

## ADR-007: Actualización en tiempo casi real por *polling* REST
* **Contexto:** El pasajero necesita ver posiciones y ETA actualizados, pero no se requiere latencia de milisegundos.
* **Decisión:** La PWA del pasajero consulta la API cada 10 s (*polling*). Se mantiene la API sin estado y compatible con el caché del navegador.
* **Consecuencias Positivas:** Simplicidad, sin conexiones persistentes y fácil escalado horizontal.
* **Consecuencias Negativas:** Más solicitudes que con conexiones persistentes. Evolución prevista: Server-Sent Events (SSE) sin cambiar el dominio.

## ADR-008: Bus de eventos interno en memoria (Observer)
* **Contexto:** Al llegar una posición deben ocurrir efectos secundarios (evaluar alertas, guardar historial) que no deben retrasar la respuesta al conductor ni acoplar el módulo Seguimiento a Suscripciones o Notificaciones.
* **Decisión:** Un `EventBus` en memoria (`EventEmitter`). Seguimiento publica `PosicionActualizada`; Suscripciones y el escritor de historial se suscriben.
* **Consecuencias Positivas:** Desacople total entre módulos; respuesta rápida al conductor.
* **Consecuencias Negativas:** Los eventos se pierden si el proceso cae (aceptable en el MVP). Evolución: cola persistente (Redis Streams / RabbitMQ) si se extrae Seguimiento.
