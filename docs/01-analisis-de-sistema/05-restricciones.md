# Restricciones Técnicas
* **RC01 - Aplicación Web / PWA:** Accesible desde navegadores modernos en escritorio y móvil, sin instalar apps nativas.
* **RC02 - Control de Versiones:** Código en repositorio Git con integración continua.
* **RC03 - Comunicación vía API REST:** Desacoplamiento total entre frontends y backend mediante HTTP/JSON.
* **RC04 - Geolocalización desde el celular del conductor:** En el MVP la posición proviene de la *Geolocation API* del navegador; no hay hardware GPS dedicado.
* **RC05 - Ruteo externo:** No se desarrolla un motor de ruteo propio; se integra un servicio externo mediante API.
* **RC06 - Protección de datos personales:** Cumplimiento de la Ley N.° 29733 (Protección de Datos Personales del Perú). La ubicación del conductor solo se captura durante un recorrido activo y no se expone su identidad al pasajero.
* **RC07 - Costo contenido:** Preferir componentes de código abierto y planes gratuitos (OpenStreetMap, Leaflet, OSRM) por el contexto académico.
