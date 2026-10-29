# Requisitos Funcionales y Trazabilidad
| ID | Requisito Funcional | Historia Asociada | Descripción Técnica |
|---|---|:---:|---|
| **RF01** | Consulta de rutas y paradas | HU01 | Listado de rutas y paradas; búsqueda de paradas cercanas por geolocalización (consulta espacial con PostGIS). |
| **RF02** | Consulta de ETA por parada | HU02 | Cálculo de minutos restantes de los próximos vehículos a una parada, con nivel de confianza. |
| **RF03** | Mapa de vehículos en vivo | HU03 | Posiciones vigentes de los vehículos de una ruta, actualizadas por *polling* cada 10 s. |
| **RF04** | Gestión de recorridos | HU04 | Iniciar y finalizar recorrido; un conductor solo puede tener uno activo. |
| **RF05** | Reporte de posición | HU04 | Recepción periódica (cada 5 s) de latitud, longitud, velocidad y marca de tiempo, con soporte de envío en lote tras pérdida de señal. |
| **RF06** | Gestión de flota | HU05 | CRUD de vehículos y conductores; asignación de vehículo a ruta. |
| **RF07** | Administración de red de transporte | HU06 | CRUD de empresas, rutas (con trazado) y paradas ordenadas. |
| **RF08** | Paradas favoritas | HU07 | Agregar, listar y quitar favoritos del pasajero autenticado. |
| **RF09** | Alertas de proximidad | HU07 | Notificación push cuando el ETA de un vehículo a una parada favorita sea menor o igual al umbral del usuario. |
| **RF10** | Reportes de puntualidad | HU08 | Historial de recorridos y comparación entre tiempos estimados y reales por ruta. |
| **RF11** | Autenticación y roles | Transversal | Registro, login, JWT y autorización por rol (PASAJERO, CONDUCTOR, OPERADOR, ADMIN). La consulta de ETA y mapa es **pública**. |
