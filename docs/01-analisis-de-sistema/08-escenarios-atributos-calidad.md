# Escenarios de Atributos de Calidad (Formato SEI)

* **EQ-01 (Rendimiento):**
  * *Fuente:* Pasajero (cliente web).
  * *Estímulo:* Consulta el ETA de una parada.
  * *Artefacto:* Contenedor API ETA + Redis.
  * *Respuesta:* El 95% de las solicitudes se resuelve en un tiempo $t \le 2$ segundos con menos del 1% de errores con 300 pasajeros simultáneos.
* **EQ-02 (Disponibilidad ante falla externa):**
  * *Fuente:* Falla del Servicio de Mapas y Ruteo (caído o lento).
  * *Estímulo:* Consulta de ETA durante la indisponibilidad.
  * *Artefacto:* Módulo ETA (`EtaConRespaldo`).
  * *Respuesta:* El sistema detecta el fallo (timeout de 2 s), aplica la estrategia de respaldo y responde **HTTP 200** en $< 3$ segundos con `confianza = BAJA`, sin caerse ni devolver error al pasajero.
* **EQ-03 (Seguridad):**
  * *Fuente:* Usuario no autenticado o con rol inadecuado.
  * *Estímulo:* Intento de invocar `POST /api/v1/posiciones` o rutas de gestión (`/api/v1/vehiculos`) sin token válido o sin el rol requerido.
  * *Artefacto:* Middleware de Seguridad / API REST.
  * *Respuesta:* El 100% de las solicitudes no válidas se bloquea de inmediato con HTTP 401/403, sin revelar trazas internas.
* **EQ-04 (Frescura de datos):**
  * *Fuente:* Vehículo en recorrido que pierde conexión.
  * *Estímulo:* No se recibe posición durante más de 60 segundos.
  * *Artefacto:* Módulo Seguimiento + Redis.
  * *Respuesta:* El vehículo se excluye del cálculo de ETA y se muestra como "sin señal"; reaparece en $\le 10$ segundos tras recibir una nueva posición.
* **EQ-05 (Escalabilidad de ingesta):**
  * *Fuente:* Flota de conductores.
  * *Estímulo:* 300 vehículos envían posición cada 5 s (≈ 60 req/s).
  * *Artefacto:* Endpoint `POST /api/v1/posiciones` + Redis.
  * *Respuesta:* El 95% de los reportes se procesa en $< 500$ ms, sin pérdida de posiciones y con la escritura del historial en PostgreSQL por lotes.
