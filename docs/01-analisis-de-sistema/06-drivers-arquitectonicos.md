# Drivers Arquitectónicos

| ID Driver | Origen | Impacto en la Arquitectura |
|---|---|---|
| **DA01** | AC03 (Escalabilidad) | API sin estado; el estado en vivo (posiciones) vive en Redis, lo que permite replicar contenedores de la API. |
| **DA02** | AC01 (Rendimiento) | Redis como almacén de la última posición por vehículo y caché de rutas/paradas (datos casi estáticos) delante de PostgreSQL. |
| **DA03** | AC04 (Seguridad) | JWT con roles, TLS/HTTPS, *rate limiting* en endpoints públicos y variables de entorno aisladas. |
| **DA04** | AC02 + RC05 (Mapas externos) | Contrato abstracto `RoutingPort` con adaptadores intercambiables y **estrategia de respaldo** (ETA por velocidad promedio) si el proveedor falla. |
| **DA05** | RC04 (GPS del celular) | App del conductor como PWA con búfer offline (IndexedDB) y envío en lote; filtrado de lecturas de baja precisión. |
| **DA06** | AC05 (Mantenibilidad) | Clean Architecture dentro de cada módulo para proteger el dominio de frameworks, BD y proveedores. |
| **DA07** | AC06 (Usabilidad en red móvil) | Respuestas JSON compactas con compresión gzip, caché de rutas en el Service Worker de la PWA. |
| **DA08** | AC07 (Frescura) | TTL de 60 s en Redis: una posición más antigua deja de existir y el vehículo pasa a estado SIN_SEÑAL. |
| **DA09** | RF01 (Búsqueda espacial) | PostgreSQL con PostGIS e índices GiST para paradas cercanas y trazados de ruta. |
