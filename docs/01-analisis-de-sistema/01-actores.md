# Actores del Sistema

| Actor | Tipo | Rol y Responsabilidad Principal |
|---|---|---|
| **Pasajero** | Persona | Consulta rutas, paradas cercanas, ETA y mapa. Opcionalmente se registra para guardar paradas favoritas y recibir alertas de proximidad. |
| **Conductor** | Persona | Inicia y finaliza su recorrido y comparte su ubicación desde su celular mientras presta servicio. |
| **Operador de Empresa** | Persona | Administra la flota y los conductores de su empresa, asigna vehículos a rutas y consulta reportes de puntualidad. |
| **Administrador** | Persona | Gobierna la plataforma: alta y baja de empresas, rutas y paradas; auditoría de usuarios. |
| **Servicio de Mapas y Ruteo** | Sistema Externo | Calcula distancia y duración de viaje por calle entre dos puntos (OSRM / Mapbox / Google Directions). |
| **Servicio de Notificaciones Push** | Sistema Externo | Entrega alertas a los dispositivos de los pasajeros (Firebase Cloud Messaging). |
| **Proveedor de Correo** | Sistema Externo | Envía correos de verificación de cuenta y recuperación de contraseña (SMTP). |
