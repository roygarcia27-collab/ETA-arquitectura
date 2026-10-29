# Nivel 2: Diagrama de Contenedores

Abre la caja "ETA Ayacucho" y revela las unidades de ejecución y almacenamiento:

1. **App Web del Pasajero (Angular PWA):** Mapa (Leaflet), paradas, ETA, favoritos y alertas. Instalable y con caché offline de rutas. Hace *polling* cada 10 s.
2. **App Web del Conductor (Angular PWA):** Inicio/fin de recorrido y envío de posición cada 5 s con la Geolocation API; búfer offline en IndexedDB.
3. **Panel de Gestión (Angular):** Administración de flota, rutas, paradas y reportes (roles Operador y Administrador).
4. **API ETA (Node.js + Express + TypeScript):** Proceso único que ejecuta el monolito modular, valida JWT, aplica casos de uso y se comunica con BD, caché y terceros.
5. **Caché y posiciones en vivo (Redis):** Última posición por vehículo (TTL 60 s) y caché de rutas/paradas.
6. **Base de Datos (PostgreSQL + PostGIS):** Persistencia transaccional y geoespacial; historial de posiciones.

![Figura 2](../../img/nivel2-contenedores.png)

> Fuente editable: [`nivel2-contenedores.puml`](../../img/fuentes-puml/nivel2-contenedores.puml)
