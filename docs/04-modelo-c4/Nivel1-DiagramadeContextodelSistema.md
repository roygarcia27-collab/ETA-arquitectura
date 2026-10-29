# Nivel 1: Diagrama de Contexto del Sistema

* **Propósito:** Mostrar ETA Ayacucho como una sola caja negra, indicando quiénes lo usan y con qué sistemas externos interactúa.
* **Relaciones Clave:**
  * `Pasajero -> ETA Ayacucho`: Consulta rutas, paradas, ETA y mapa; gestiona favoritos y alertas.
  * `Conductor -> ETA Ayacucho`: Inicia/finaliza recorrido y comparte su ubicación.
  * `Operador -> ETA Ayacucho`: Gestiona flota y consulta reportes.
  * `Administrador -> ETA Ayacucho`: Gestiona empresas, rutas y paradas.
  * `ETA Ayacucho -> Servicio de Mapas`: Solicita ruta y duración (HTTPS/REST).
  * `ETA Ayacucho -> Servicio Push`: Envía alertas de proximidad (HTTPS/REST).
  * `ETA Ayacucho -> Proveedor de Correo`: Envía correos transaccionales (SMTP).

![Figura 1](../../img/nivel1-contexto.png)

> Fuente editable: [`nivel1-contexto.puml`](../../img/fuentes-puml/nivel1-contexto.puml)
