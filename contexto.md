# Contexto Integral del Proyecto: ETA Ayacucho
**Sistema de Estimación de Hora de Llegada (ETA) para el Transporte Público Urbano de Ayacucho**

---

## 1. Resumen Ejecutivo y Ficha Técnica

| Parámetro | Detalle |
|---|---|
| **Nombre del Sistema** | **ETA Ayacucho** (Estimación de Tiempo de Llegada) |
| **Dominio y Contexto** | Transporte público urbano en la ciudad de Ayacucho, Perú (combis, microbuses, líneas de transporte). |
| **Problema Central** | Incertidumbre del pasajero sobre cuándo pasará el próximo vehículo de su línea de interés, lo que ocasiona largas esperas en la parada a la intemperie y desorganización en los traslados. |
| **Solución Propuesta** | Plataforma de tiempo casi real con seguimiento geoespacial que calcula y publica el tiempo estimado de llegada (ETA) del próximo vehículo a una parada seleccionada, permitiendo ver el mapa en vivo de unidades y configurar alertas de proximidad. |
| **Estilo Arquitectónico Macro** | **Monolito Modular en Capas** (*Modular Monolith*). Un solo proceso de despliegue con límites estrictos de módulo en memoria. |
| **Enfoque de Diseño Interno** | **Clean Architecture / Hexagonal** (Puertos y Adaptadores) por módulo, protegiendo las reglas de negocio del framework y proveedores externos. |
| **Backend** | Node.js con Express y TypeScript (REST HTTP/JSON). |
| **Persistencia Principal** | PostgreSQL 16 con extensión **PostGIS 3.4** (datos relacionales, tipos espaciales `Point` y `LineString`, índices espaciales GiST). |
| **Caché y Estado en Vivo** | **Redis 7** (almacenamiento en memoria de la última posición con TTL de 60 segundos; caché de rutas y paradas mediante Decorador). |
| **Frontend Planificado** | Workspace Angular (TypeScript) con 3 aplicaciones: App del Pasajero (PWA con mapa Leaflet + OSM), App del Conductor (PWA con Geolocation API y Wake Lock), y Panel de Gestión Web (Operador y Administrador). |
| **Integraciones Externas** | Servicio de Ruteo/Mapas (OSRM / Mapbox / Google Directions), Notificaciones Push (Firebase Cloud Messaging - FCM), Notificaciones Correo (SMTP transaccional). |
| **Despliegue** | Contenedores Docker orquestados inicialmente con Docker Compose. |

---

## 2. Análisis del Sistema: Actores, Historias, Requisitos y Restricciones

### 2.1 Actores del Sistema
1. **Pasajero (Persona):** Consulta rutas, paradas cercanas, ETA del próximo vehículo y mapa en vivo sin necesidad obligatoria de autenticarse. De registrarse, puede guardar paradas favoritas y recibir notificaciones push de proximidad.
2. **Conductor (Persona):** Inicia y finaliza su recorrido en servicio, y reporta su ubicación geográfica de forma continua desde su celular (PWA).
3. **Operador de Empresa (Persona):** Administra la flota de vehículos y conductores de su empresa, asigna unidades a rutas autorizadas y consulta reportes de puntualidad.
4. **Administrador (Persona):** Gestiona la plataforma global: alta/baja de empresas de transporte, definición de rutas con su trazado geográfico, configuración de paradas y auditoría general.
5. **Servicio de Mapas y Ruteo (Sistema Externo):** Calcula distancias y tiempos de viaje por la red vial real (ej. OSRM autoalojado o Mapbox).
6. **Servicio de Notificaciones Push (Sistema Externo):** Entrega alertas web push a dispositivos de pasajeros suscritos (Firebase Cloud Messaging).
7. **Proveedor de Correo (Sistema Externo):** Envía correos transaccionales (confirmación de cuenta, restablecimiento de contraseña vía SMTP).

### 2.2 Historias de Usuario Principales (HU)
* **HU01 (Consultar rutas y paradas):** Como pasajero, quiero consultar las rutas y paradas cercanas para saber qué línea me conviene tomar.
* **HU02 (Consultar ETA):** Como pasajero, quiero ver en cuántos minutos llegará el próximo vehículo a mi parada para planificar mi viaje.
* **HU03 (Mapa en vivo):** Como pasajero, quiero ver en un mapa dónde están los vehículos de una ruta para seguir su avance.
* **HU04 (Reportar posición):** Como conductor, quiero iniciar/finalizar recorrido y transmitir mi ubicación automáticamente.
* **HU05 (Gestión de flota):** Como operador, quiero gestionar mis vehículos y conductores asignándolos a rutas.
* **HU06 (Administrar red):** Como administrador, quiero gestionar empresas, rutas y paradas georreferenciadas.
* **HU07 (Favoritos y alertas):** Como pasajero, quiero registrar paradas favoritas y recibir alertas cuando el vehículo esté a N minutos.
* **HU08 (Reportes de puntualidad):** Como operador, quiero evaluar el cumplimiento de itinerarios e historial de recorridos.

### 2.3 Requisitos Funcionales (RF)
* **RF01:** Consulta de rutas y paradas geolocalizadas con PostGIS (`ST_DWithin`).
* **RF02:** Cálculo de ETA por parada con indicación de nivel de confianza (`ALTA` o `BAJA`).
* **RF03:** Visualización de vehículos en vivo mediante *polling* HTTP cada 10 s.
* **RF04:** Gestión de ciclo de vida del recorrido (máquina de estados: un solo recorrido activo por conductor).
* **RF05:** Reporte de posición GPS cada 5 s desde el móvil del conductor, con soporte para envío en lote tras desconexión.
* **RF06:** CRUD de vehículos, conductores y asignaciones por empresa.
* **RF07:** CRUD de empresas, rutas (con geometrías `LineString`) y paradas ordenadas (`Point`).
* **RF08:** Gestión de paradas favoritas para usuarios autenticados.
* **RF09:** Alertas automáticas cuando el ETA sea menor o igual al umbral fijado por el usuario.
* **RF10:** Reportes de puntualidad comparando ETA estimado versus tiempo real de llegada.
* **RF11:** Autenticación JWT y control de acceso basado en roles (`PASAJERO`, `CONDUCTOR`, `OPERADOR`, `ADMIN`). Consulta de rutas y ETA pública.

### 2.4 Atributos de Calidad (AC) y Escenarios SEI
* **AC01 - Rendimiento (EQ-01):** El 95% de las consultas de ETA debe responder en $t \le 2$ s con menos de 1% de fallos bajo una carga de 300 pasajeros concurrentes.
* **AC02 - Disponibilidad y Resiliencia (EQ-02):** Si el servicio externo de mapas (OSRM) falla o se demora más de 2 s, el sistema aplica la estrategia de respaldo (`EtaPorVelocidadPromedio`) y responde en menos de 3 s con `confianza = BAJA` (HTTP 200), sin romper la experiencia del pasajero.
* **AC03 - Escalabilidad (EQ-05):** Ingesta de hasta 300 vehículos reportando cada 5 s (≈ 60 req/s pico) procesada en $< 500$ ms mediante Redis, insertando el historial en PostgreSQL por lotes asíncronos cada 30 s.
* **AC04 - Seguridad (EQ-03):** 100% de solicitudes no autorizadas a endpoints protegidos rechazadas con HTTP 401/403 sin exponer trazas internas. Cumplimiento de la Ley N.° 29733 de Protección de Datos Personales del Perú (la ubicación del conductor solo se capta en servicio activo y no se expone su identidad personal a pasajeros).
* **AC05 - Mantenibilidad:** Desacoplamiento estricto gracias a Clean Architecture; reemplazo de mapas o base de datos sin alterar lógica de negocio.
* **AC06 - Eficiencia en Red Móvil:** Respuestas JSON livianas con compresión gzip, búfer offline en el conductor (IndexedDB) y caché de rutas estáticas en el Service Worker de la PWA.
* **AC07 - Frescura de Datos (EQ-04):** Si un vehículo deja de reportar por más de 60 segundos, el TTL de Redis expira, se le marca como `SIN_SEÑAL` y se descarta del cálculo de ETA.

### 2.5 Reglas de Negocio Clave (RN)
* **RN-01:** Coordenadas válidas en rangos $[-90, 90]$ de latitud y $[-180, 180]$ de longitud.
* **RN-02:** El ETA no puede ser negativo y se redondea hacia arriba a minutos enteros.
* **RN-03 (Vigencia):** Solo se consideran posiciones con antigüedad $\le 60$ s.
* **RN-04 (Sentido de ruta):** Solo computan vehículos que aún no han pasado la parada (`ultimaParadaOrden < parada.orden`).
* **RN-05:** Un conductor solo puede tener un recorrido `EN_CURSO` a la vez.
* **RN-06:** Un vehículo solo puede iniciar recorrido en una ruta asignada a su empresa.
* **RN-07:** Recorridos en estado `FINALIZADO` o `CANCELADO` son inmutables.
* **RN-08:** La parada consultada debe pertenecer a la ruta indicada.
* **RN-09:** Se limita a los próximos 3 vehículos más cercanos por consulta (configurable).

---

## 3. Decisiones de Arquitectura (ADRs)

1. **ADR-001 (Monolito Modular):** Se seleccionó un monolito modular en Node.js/Express para evitar la sobrecarga operativa, latencia de red y costos de microservicios en un proyecto con equipo reducido. Mantiene módulos con límites estrictos y permite extraer el módulo *Seguimiento* a microservicio en el futuro si la ingesta de telemetría lo exige.
2. **ADR-002 (Clean Architecture interna):** División en 4 capas concéntricas (*Dominio*, *Aplicación*, *Infraestructura*, *Presentación*) donde la regla de dependencias siempre apunta al dominio.
3. **ADR-003 (Redis para Telemetría en Vivo y Caché):** Las posiciones cambian cada 5 s y solo importa la última. Redis almacena la última posición con TTL de 60 s, reduciendo drásticamente la carga sobre PostgreSQL. También cachea rutas y paradas mediante el patrón Decorador.
4. **ADR-004 (Puertos y Adaptadores para Mapas + Fallback):** La interfaz `RoutingPort` aísla al sistema del proveedor vial (OSRM, Mapbox). La estrategia de cálculo `EtaConRespaldo` conmuta a cálculo euclidiano por velocidad promedio si el servicio externo no responde en 2 segundos.
5. **ADR-005 (PWA del Conductor sin Hardware GPS Dedicado):** Se aprovecha el GPS del smartphone del chofer mediante la *HTML5 Geolocation API*, *Screen Wake Lock API* e *IndexedDB* como búfer local ante caídas de red 3G/4G.
6. **ADR-006 (PostgreSQL con PostGIS):** Persistencia relacional de catálogos y persistencia geoespacial estándar con índices GiST para búsquedas espaciales optimizadas.
7. **ADR-007 (Polling REST para Tiempo Casi Real):** El frontend del pasajero consulta cada 10 s por REST HTTP. Mantiene el backend sin estado y permite escalado horizontal simple, dejando la puerta abierta a SSE (*Server-Sent Events*).
8. **ADR-008 (Bus de Eventos Interno en Memoria):** Publicación del evento `PosicionActualizada` en memoria para desacoplar el guardado del historial en PostgreSQL y la evaluación de alertas de proximidad push, respondiendo HTTP 204 de inmediato al conductor.

---

## 4. Arquitectura C4 y Diagramas PlantUML (Análisis de Fuentes)

A partir de la inspección de los archivos `.puml` en `img/fuentes-puml/`, se sintetiza la estructura del sistema en los 4 niveles del Modelo C4:

### 4.1 C4 Nivel 1: Contexto del Sistema (`nivel1-contexto.puml`)
* El sistema **ETA Ayacucho** actúa como el núcleo central que atiende a cuatro tipos de usuarios humanos: **Pasajeros** (consultas), **Conductores** (reporte de posición), **Operadores** (gestión de flota) y **Administradores** (red vial).
* Se comunica externamente mediante HTTPS/REST con el **Servicio de Mapas y Ruteo** y con el **Servicio de Push (FCM)**, y vía SMTP con el **Proveedor de Correo**.

### 4.2 C4 Nivel 2: Contenedores (`nivel2-contenedores.puml`)
* **3 Clientes Web / PWA (Angular):**
  1. *App Pasajero:* Mapa Leaflet con OpenStreetMap, búsqueda de paradas, visualización de ETA y gestión de favoritos.
  2. *App Conductor:* Panel de inicio/fin de recorrido, capturador de GPS continuo y sincronizador de lotes offline.
  3. *Panel de Gestión:* Dashboard administrativo para empresas, vehículos y reportes de puntualidad.
* **1 Servidor de Aplicación (API ETA - Node.js + Express):** Proceso monolítico modular que expone la API REST, autentica con JWT y coordina los casos de uso.
* **1 Almacén en Memoria (Redis):** Tablas de hashes con clave `posicion:{vehiculoId}` con expiración a los 60s, y caché de paradas serializadas.
* **1 Base de Datos Relacional y Espacial (PostgreSQL + PostGIS):** Almacén definitivo de entidades y tabla histórica de posiciones.

### 4.3 C4 Nivel 3: Componentes del Monolito (`nivel3-componentes.puml`)
El contenedor **API ETA** se descompone en 9 módulos acoplados únicamente por contratos:
1. `src/api`: Ruteo central, middlewares (JWT, validación, roles, rate limiters).
2. `Usuarios`: Autenticación, registro, perfiles y emisión de tokens.
3. `Empresas`: Catálogo de empresas y asociaciones de transporte.
4. `Rutas`: Catálogo de líneas, paradas y trazados espaciales con capa de caché Redis.
5. `Flota`: Vehículos, conductores, turnos y entidad `Recorrido`.
6. `Seguimiento`: Ingestor de posiciones y monitor del estado de señal.
7. `ETA`: Núcleo algorítmico de estimación de llegada.
8. `Suscripciones`: Almacén de paradas favoritas y reglas de alerta.
9. `Notificaciones`: Fachada de envío hacia FCM y SMTP.
10. `EventBus`: Canal de eventos desacoplado en memoria (`EventEmitter`).

> **Reglas fundamentales de interacción:**
> - Los módulos se comunican en memoria **únicamente** a través del `index.ts` público del módulo destino.
> - **Prohibido realizar consultas SQL directas a tablas pertenecientes a otro módulo.**
> - Toda reacción secundaria asíncrona viaja a través del `EventBus`.

### 4.4 C4 Nivel 4: Diagrama de Clases del Módulo ETA (`nivel4-clases.puml`, `principio-dip.puml`, `paquetes-modulo-eta.puml`)
* **Presentación:** `EtaController` maneja HTTP y valida parámetros de consulta.
* **Aplicación:** `ConsultarEtaUseCase` orquesta la llamada a puertos sin conocer bases de datos ni redes.
* **Dominio:**
  - *Value Objects:* `Coordenada` (con cálculo de distancia Haversine), `EstimacionEta` (inmutable, con minutos, método y confianza).
  - *Entidades:* `Parada`, `PosicionVehiculo`.
  - *Puertos:* `ParadasPort`, `PosicionesPort`, `RoutingPort`, `EtaStrategy`.
  - *Estrategias:* `EtaPorRuteo` (vía OSRM), `EtaPorVelocidadPromedio` (vía Haversine + factor rodeo urbano 1.3), `EtaConRespaldo` (patrón composite/fallback).
* **Infraestructura:** `OsrmRoutingAdapter`, `RutasApiAdapter`, `SeguimientoApiAdapter`.

### 4.5 Flujos de Secuencia Críticos
1. **Consultar ETA (`nivel4-secuencia-consultar-eta.puml`):**
   - El pasajero solicita el ETA de una parada.
   - `ConsultarEtaUseCase` valida la parada en `ParadasPort`.
   - Consulta posiciones vigentes en `PosicionesPort` (Redis).
   - Filtra vehículos caducados ($> 60$ s) o que ya pasaron la parada (`ultimaParadaOrden >= parada.orden`).
   - Lanza en paralelo (`Promise.all`) la estimación para cada vehículo candidato mediante `EtaConRespaldo`.
   - Si OSRM responde en $\le 2$ s $\rightarrow$ confianza `ALTA`. Si hay timeout/error $\rightarrow$ fallback a velocidad promedio con confianza `BAJA`.
   - Ordena por tiempo de llegada y retorna los 3 más próximos.
2. **Reportar Posición GPS (`nivel4-secuencia-reportar-posicion.puml`):**
   - El conductor envía coordenadas cada 5 s con JWT.
   - `ReportarPosicionUseCase` verifica que exista un `Recorrido` activo.
   - Valida coordenadas y actualiza la clave en Redis con TTL de 60 s.
   - Emite el evento `PosicionActualizada` en el `EventBus`.
   - **Retorna inmediatamente HTTP 204 No Content al conductor** (latencia $< 50$ ms).
   - En segundo plano, `AlertasHandler` evalúa favoritos y despacha notificaciones FCM si se alcanza el umbral, y `HistorialWriter` encola la posición para inserción masiva en PostgreSQL cada 30 s.

### 4.6 Máquina de Estados del Recorrido (`estados-recorrido.puml`)
* `[*] --> PROGRAMADO`
* `PROGRAMADO --> EN_CURSO` (conductor inicia en app)
* `PROGRAMADO --> CANCELADO` (operador anula)
* `EN_CURSO --> SIN_SEÑAL` (inactividad $> 60$ s en Redis)
* `SIN_SEÑAL --> EN_CURSO` (se reanuda la telemetría)
* `EN_CURSO --> FINALIZADO` (conductor marca fin de servicio)
* `SIN_SEÑAL --> FINALIZADO` (cierre automático por timeout prolongado)

### 4.7 Modelo de Datos Relacional (`modelo-datos.puml`)
1. `usuario` (id, nombre, email, password_hash, rol, empresa_id, activo)
2. `empresa` (id, nombre, ruc, activa)
3. `ruta` (id, codigo, nombre, empresa_id, trazado [geography LineString], activa)
4. `parada_ruta` (id, ruta_id, orden, nombre, ubicacion [geography Point])
5. `vehiculo` (id, placa, empresa_id, ruta_id, activo)
6. `recorrido` (id, vehiculo_id, conductor_id, ruta_id, estado, inicio, fin)
7. `posicion_historial` (id, recorrido_id, ubicacion [geography Point], velocidad_kmh, ultima_parada_orden, registrada_en)
8. `parada_favorita` (id, usuario_id, parada_id)
9. `alerta_proximidad` (id, usuario_id, parada_id, umbral_minutos, activa, push_token)

---

## 5. Patrones de Diseño Implementados

* **Strategy:** `EtaStrategy` permite alternar entre `EtaPorRuteo` (OSRM), `EtaPorVelocidadPromedio` y la futura `EtaPorHistorico` sin modificar el caso de uso.
* **Adapter:** `OsrmRoutingAdapter` y `MapboxRoutingAdapter` traducen el contrato de `RoutingPort` a la API HTTP externa.
* **Repository & Decorator:** `PostgresRutaRepository` implementa el acceso con PostGIS, y `CachedRutaRepository` envuelve al repositorio para consultar primero Redis.
* **Observer:** Desacoplamiento entre la ingesta de telemetría y los efectos colaterales (evaluación de alertas y guardado de historial) a través de `EventBus`.
* **Facade:** `NotificacionFacade` unifica la preparación de plantillas, selección de canales y envío a Firebase Cloud Messaging.
* **Factory:** `PosicionFactory` crea instancias válidas de `PosicionVehiculo`, comprobando rangos y deduciendo la última parada rebasada.

---

## 6. Estado Actual de Desarrollo: Qué Está Desarrollado y Qué NO (Diagnóstico de Código)

Al revisar exhaustivamente la carpeta `tecnologia/boilerplate-clean-architecture` frente a la documentación de `docs/` y los diagramas `.puml`, se presenta el siguiente balance detallado:

```
[ESTADO GENERAL DEL PROYECTO]
├── Documentación y Diseño Arquitectónico (Docs & PUML)  =======>  95% COMPLETADO
├── Backend: Módulo ETA (Caso de Referencia)              =======>  95% COMPLETADO
├── Backend: Módulos Rutas y Seguimiento                  =======>  15% (Mocks en memoria)
├── Backend: Módulos Usuarios, Empresas, Flota, etc.      =======>   0% (NO CREADOS)
├── Base de Datos & Persistencia (PostgreSQL / Redis)     =======>  10% (Docker listo, faltan esquemas/conexiones)
└── Frontend (Apps Angular PWA para Pasajero/Conductor)   =======>   0% (NO CREADOS)
```

### 6.1 Lo que SÍ está desarrollado al 100% (o casi 100%)

1. **Documentación de Arquitectura Completa:**
   - Especificación técnica maestra de más de 1,500 líneas (`docs/00-especificacion-maestra-completa.md` y sus carpetas modulares `docs/01` a `05`).
   - Definición formal de Actores, 8 Historias de Usuario, 11 Requisitos Funcionales, 7 Atributos de Calidad, 7 Restricciones, 9 Drivers y 5 Escenarios SEI.
   - 8 Registros de Decisiones Arquitectónicas (ADR-001 a ADR-008).
   - 16 diagramas en PlantUML que cubren los 4 niveles C4, secuencias, estados, modelo ER y patrones de diseño.
2. **Módulo ETA Backend (`src/modules/eta`):**
   - **Dominio:** Completamente desarrollado e independiente de librerías externas. Clases `Coordenada`, `Parada`, `PosicionVehiculo`, `EstimacionEta`, enumeraciones `MetodoEstimacion`, `NivelConfianza`, y puertos `ParadasPort`, `PosicionesPort`, `RoutingPort`, `EtaStrategy`.
   - **Estrategias:** `EtaPorRuteo` (cálculo sobre red vial), `EtaPorVelocidadPromedio` (cálculo de contingencia por distancia haversine), y `EtaConRespaldo` (fallback automático con tolerancia a fallos).
   - **Aplicación:** Caso de uso `ConsultarEtaUseCase` con filtrado de vehículos caducados, filtrado de vehículos pasados, cálculo paralelo y ordenamiento.
   - **Infraestructura:** `OsrmRoutingAdapter` (con timeout y llamada fetch a la API de OSRM), `MapboxRoutingAdapter` (stub), `RutasApiAdapter` y `SeguimientoApiAdapter`.
   - **Presentación:** `EtaController` y enrutador Express `eta.routes.ts`.
   - **Composition Root:** `eta.module.ts` ensambla las dependencias con inversión de control limpia.
   - **Pruebas Unitarias:** Suites Jest completas para `coordenada.test.ts` y `consultar-eta.use-case.test.ts` (verificando filtrado, cálculos y escenarios de fallback ante caídas de OSRM).

---

### 6.2 Lo que NO está desarrollado al 100% (Especialmente en Tecnología)

La carpeta `tecnologia/` contiene únicamente un **boilerplate de demostración** para validar el cálculo del ETA. Todo lo siguiente está incompleto o pendiente:

#### A. En el Backend (`tecnologia/boilerplate-clean-architecture/src/modules/`)
* **Módulo Rutas (`src/modules/rutas/index.ts`):**
  - **Estado:** ~15%. Solo contiene una función stub en memoria (`crearRutasApiEnMemoria`) con 4 paradas de juguete con coordenadas ficticias (`parada-1` a `parada-4`).
  - **Falta:** No tiene arquitectura en 4 capas, no consulta a PostgreSQL con PostGIS, no almacena geometrías reales de rutas en Ayacucho, ni implementa la capa `CachedRutaRepository` con Redis (ADR-003). Tampoco tiene endpoints para crear o modificar rutas/paradas.
* **Módulo Seguimiento (`src/modules/seguimiento/index.ts`):**
  - **Estado:** ~15%. Solo contiene una simulación estática en memoria (`crearSeguimientoApiEnMemoria`) con 4 vehículos de prueba (`vehiculo-A` a `vehiculo-D`).
  - **Falta:** No tiene endpoints HTTP `POST /api/v1/posiciones` para recibir reportes de conductores, no se conecta a Redis ni aplica el TTL real de 60 s, no calcula la última parada visitada y no interactúa con ningún `EventBus`.
* **Módulos Totalmente Inexistentes en Código (0%):**
  - `Usuarios`: No existen las entidades de usuario, hashing de contraseñas (bcrypt), generación y verificación de JWT, ni middlewares de autorización por roles (`PASAJERO`, `CONDUCTOR`, `OPERADOR`, `ADMIN`).
  - `Empresas`: No existe CRUD de empresas/asociaciones de transporte ni asignación de rutas.
  - `Flota`: No existe registro de vehículos, conductores, asignaciones de turno ni el modelo `Recorrido` con su máquina de estados.
  - `Suscripciones`: No existe lógica para guardar paradas favoritas ni registrar alertas de proximidad con umbrales en minutos.
  - `Notificaciones`: No existe la fachada `NotificacionFacade` ni el adaptador para Web Push (`FcmPushAdapter` con Firebase) ni el cliente SMTP de correo.
  - `EventBus`: No existe el bus de eventos en memoria (`EventEmitter`) ni los handlers `AlertasHandler` y `HistorialWriter`.

#### B. En Base de Datos y Persistencia
* **Contenedores:** El archivo `docker-compose.yml` define imágenes para `postgis/postgis:16-3.4` y `redis:7-alpine`, pero **no están conectados a la aplicación**.
* **Falta:**
  - No existen archivos de migración DDL (archivos `.sql` o migraciones con Knex/TypeORM/Prisma) para crear las 9 tablas del modelo de datos (`modelo-datos.puml`).
  - No se configuran extensiones PostGIS (`CREATE EXTENSION postgis;`) ni índices espaciales GiST en código.
  - No hay clientes de conexión a base de datos (como `pg`, `ioredis` o similar) configurados en el proyecto (`package.json` solo tiene dependencias de Express y Jest).

#### C. En Frontend y Aplicaciones Cliente (`apps/`)
* **Estado:** 0% en código.
* **Falta:** En la arquitectura se especifican 3 aplicaciones Angular en un monorepositorio (`apps/web-pasajero`, `apps/web-conductor`, `apps/web-gestion`). En el repositorio actual no existe la carpeta `apps/` ni ningún proyecto de frontend. No se ha implementado el mapa Leaflet, la PWA del pasajero ni la PWA del conductor con captura de geolocalización continua.

#### D. En la Documentación / Activos Gráficos
* Los archivos PlantUML están completos en `img/fuentes-puml/`, pero las imágenes compiladas `.png` referenciadas en los documentos Markdown en `img/` aún no han sido exportadas físicamente (se encuentran como enlaces pendientes).
* Los parámetros de transporte urbano (velocidad promedio de 15 km/h, tiempos de parada, factor de rodeo de 1.3 y coordenadas geográficas) son supuestos académicos que requieren calibración con datos reales de las líneas de Ayacucho.

---

## 7. Plan de Acción y Hoja de Ruta para Completar el Sistema

Para llevar el proyecto desde su estado actual de prototipo de referencia hasta una implementación completa, se recomienda seguir el siguiente plan de trabajo por fases:

1. **Fase 1: Infraestructura y Persistencia Real (Sprint 0 - 1)**
   - Configurar cliente PostgreSQL (`pg` / `knex` / `typeorm`) y cliente Redis (`ioredis`) en `package.json`.
   - Crear los scripts de migración SQL para las 9 tablas y habilitar la extensión PostGIS.
   - Implementar el `EventBus` básico en `src/shared/event-bus/`.
2. **Fase 2: Autenticación y Red de Transporte (Sprint 1 - 2)**
   - Desarrollar el módulo `Usuarios` (registro, login, JWT y roles).
   - Desarrollar el módulo `Rutas` en 4 capas (PostGIS + caché Redis con Decorador) y registrar rutas/paradas reales de Ayacucho.
   - Desarrollar el módulo `Empresas`.
3. **Fase 3: Flota, Recorridos y Telemetría en Vivo (Sprint 2 - 3)**
   - Desarrollar el módulo `Flota` (vehículos, conductores y entidad `Recorrido`).
   - Desarrollar el módulo `Seguimiento` con el endpoint `POST /api/v1/posiciones`, almacenamiento en Redis con TTL de 60 s y publicación de `PosicionActualizada` en el `EventBus`.
   - Conectar los adaptadores `RutasApiAdapter` y `SeguimientoApiAdapter` a las APIs reales en vez de los mocks en memoria.
4. **Fase 4: Alertas, Notificaciones y Reportes (Sprint 4 - 5)**
   - Desarrollar `Suscripciones` (favoritos y umbrales de alerta).
   - Desarrollar `Notificaciones` con la fachada `NotificacionFacade` y adaptador Firebase Cloud Messaging.
   - Inserción en lote del historial de posiciones (`HistorialWriter`).
5. **Fase 5: Clientes Frontend (PWA)**
   - Inicializar la PWA del Pasajero (Angular + Leaflet) con consumo del endpoint `/eta` y mapa de buses.
   - Inicializar la PWA del Conductor (Angular) con la *Geolocation API* y *Screen Wake Lock*.
   - Inicializar el Panel de Gestión para Operadores y Administradores.
6. **Fase 6: Compilación de Diagramas y Pruebas de Carga**
   - Exportar los 16 archivos `.puml` a formato PNG/SVG dentro de `img/`.
   - Ejecutar pruebas de carga con `k6` para validar los escenarios SEI de rendimiento (EQ-01 y EQ-05).
