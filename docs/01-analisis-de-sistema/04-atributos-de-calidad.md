# Atributos de Calidad
* **AC01 - Rendimiento:** La consulta de ETA y del mapa debe responder con baja latencia aun con muchos pasajeros consultando a la vez.
* **AC02 - Disponibilidad y tolerancia a fallos externos:** Si el servicio de mapas falla, el sistema debe degradarse con elegancia y seguir entregando un ETA aproximado.
* **AC03 - Escalabilidad:** Debe absorber el crecimiento de vehículos y pasajeros sin reescritura estructural.
* **AC04 - Seguridad y privacidad:** Control de acceso por roles, cifrado en tránsito y protección de la ubicación del conductor.
* **AC05 - Mantenibilidad:** Alto desacoplamiento para poder cambiar el proveedor de mapas o el algoritmo de ETA sin afectar el resto.
* **AC06 - Usabilidad y eficiencia en red móvil:** Respuestas livianas y uso correcto en celulares de gama baja y conexiones lentas.
* **AC07 - Exactitud y frescura de los datos:** El ETA debe ser razonablemente preciso y nunca basarse en posiciones obsoletas.
