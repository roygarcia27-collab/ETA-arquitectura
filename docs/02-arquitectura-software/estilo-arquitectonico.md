# Estilo Arquitectónico: Monolito Modular en Capas
* **Contexto:** Proyecto con equipo reducido, plazos académicos acotados y una flota inicial pequeña. Los microservicios añaden complejidad de despliegue, red y monitoreo que no se justifica.
* **Decisión:** Implementar un **Monolito Modular** en Node.js + Express con módulos de límites claros (Usuarios, Empresas, Rutas, Flota, Seguimiento, ETA, Suscripciones, Notificaciones), tablas separadas por módulo y comunicación interna en memoria mediante la API pública (`index.ts`) de cada módulo.
* **Consecuencias Positivas:** Un solo despliegue, simplicidad operativa y camino abierto para extraer **Seguimiento** como servicio independiente si la ingesta crece.
* **Consecuencias Negativas:** Exige disciplina para no cruzar límites modulares ni consultar tablas de otro módulo.

## Comparativa frente a microservicios

| Criterio | Monolito Modular (elegido) | Microservicios |
|---|---|---|
| Despliegue | Un solo artefacto | Múltiples servicios y orquestación |
| Latencia entre módulos | Llamadas en memoria | Llamadas de red |
| Complejidad operativa | Baja | Alta |
| Ajuste al equipo y plazo del proyecto | Alto | Bajo |
| Evolución | Se puede extraer **Seguimiento** como servicio si la ingesta crece | Ya separado desde el inicio |

## Vista en capas

![Arquitectura monolítica en capas](../../img/arquitectura-monolitica-capas.png)

> Fuente editable: [`arquitectura-monolitica-capas.puml`](../../img/fuentes-puml/arquitectura-monolitica-capas.puml)
