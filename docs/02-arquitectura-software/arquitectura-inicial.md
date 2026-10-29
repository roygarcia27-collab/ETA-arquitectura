# Arquitectura Inicial: Visión General del Proyecto

* **Nombre del Sistema:** ETA Ayacucho, plataforma de estimación de llegada para transporte público urbano.
* **Tipo de Sistema:** Aplicación web progresiva (PWA) de información en tiempo casi real, con seguimiento geoespacial de flota.
* **Problema que resuelve:** El pasajero no sabe cuánto demorará en pasar el próximo vehículo (combi, microbús, etc.) de una línea, lo que genera esperas largas e inciertas en la parada.
* **Estilo Arquitectónico Macro:** Monolito Modular en Capas (Modular Monolith).
* **Enfoque de Diseño Interno:** Arquitectura Limpia (Clean Architecture / Hexagonal, Puertos y Adaptadores).
* **Tecnologías Seleccionadas:**
  * **Frontend:** 3 aplicaciones Angular (TypeScript) en un mismo workspace: App del Pasajero (PWA), App del Conductor (PWA) y Panel de Gestión. Mapa con Leaflet + OpenStreetMap.
  * **Backend:** Node.js con Express y TypeScript.
  * **Persistencia Principal:** PostgreSQL + extensión **PostGIS** (datos relacionales y geoespaciales).
  * **Caché y estado en vivo:** Redis (última posición por vehículo con TTL y caché de rutas/paradas).
  * **Protocolos de Integración:** HTTPS / REST con JSON.
  * **Despliegue:** Contenedores Docker (docker-compose en el MVP).
* **Integraciones Externas:** Servicio de Mapas y Ruteo (OSRM / Mapbox / Google Directions), Notificaciones Push (Firebase Cloud Messaging) y Proveedor de Correo (SMTP).

## 1.1 Alcance del MVP y supuestos de diseño

| Dentro del alcance | Fuera del alcance (evolución futura) |
|---|---|
| Consulta de rutas, paradas y ETA | Venta de pasajes o pagos electrónicos |
| Mapa con vehículos en tiempo casi real | Dispositivos GPS dedicados en los vehículos |
| App del conductor que reporta su posición (celular) | Predicción con Machine Learning |
| Favoritos y alertas de proximidad | Integración con sistemas municipales |
| Gestión de empresas, flota y rutas; reportes de puntualidad | App nativa (iOS/Android) |

**Supuestos de diseño (validar con datos reales de Ayacucho):**

* Hasta **300 vehículos activos simultáneos** y **300 pasajeros concurrentes** consultando.
* Cada vehículo reporta su posición cada **5 segundos**, es decir ≈ 60 solicitudes/segundo en el pico (300 ÷ 5).
* La conectividad móvil puede ser intermitente en algunos tramos de la ciudad.
* El concepto **Empresa** incluye empresas formales y asociaciones de transportistas.
* Los parámetros (TTL de posición = 60 s, velocidad promedio urbana = 15 km/h, máximo de 3 vehículos por consulta) son **configurables** y deben calibrarse con pruebas en campo.

## Estructura del proyecto de código

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


## Vistas relacionadas
* Estilo y capas: [`estilo-arquitectonico.md`](estilo-arquitectonico.md)
* Modelo C4: [`../04-modelo-c4/`](../04-modelo-c4/)
