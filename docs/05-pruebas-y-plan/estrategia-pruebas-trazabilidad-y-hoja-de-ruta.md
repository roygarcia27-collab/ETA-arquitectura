# Estrategia de Pruebas, Trazabilidad y Hoja de Ruta

## 7.1 Estrategia de Pruebas vinculada a los Escenarios de Calidad

| Escenario | Tipo de prueba | Herramienta sugerida | Criterio de aceptación |
|---|---|---|---|
| Reglas RN-01 a RN-09 | Unitaria (dominio puro) | Jest | Todas las reglas cubiertas sin BD ni red. |
| Caso de uso `ConsultarEtaUseCase` | Unitaria con *fakes* de los puertos | Jest | Filtra posiciones vencidas y vehículos que ya pasaron la parada. |
| EQ-02 (falla de mapas) | Integración con servicio simulado que falla o demora | Jest + mock HTTP | Responde 200 con `confianza = BAJA` en < 3 s. |
| EQ-03 (seguridad) | Integración de API | Supertest | 401/403 en el 100% de los accesos inválidos. |
| EQ-04 (frescura) | Integración con Redis | Jest + Redis de pruebas | Tras 60 s sin posición el vehículo no aparece en el ETA. |
| EQ-01 y EQ-05 (rendimiento / ingesta) | Carga | k6 | p95 ≤ 2 s con 300 usuarios; p95 < 500 ms con ≈ 60 req/s de posiciones. |
| Flujo extremo a extremo | E2E | Playwright / Cypress | El pasajero ve el ETA tras iniciar un recorrido simulado. |

## 7.2 Matriz de Trazabilidad Global

| HU | RF | Módulo(s) | Atributos / Escenarios | ADR / Patrón |
|:---:|:---:|---|---|---|
| HU01 | RF01 | Rutas | AC01, AC06 | ADR-003, ADR-006 / Repository, Decorator |
| HU02 | RF02 | ETA, Rutas, Seguimiento | AC01, AC02, AC07 / EQ-01, EQ-02, EQ-04 | ADR-004 / Strategy, Adapter |
| HU03 | RF03 | Seguimiento | AC01, AC07 / EQ-01, EQ-04 | ADR-003, ADR-007 |
| HU04 | RF04, RF05 | Flota, Seguimiento | AC03, AC04 / EQ-03, EQ-05 | ADR-003, ADR-005, ADR-008 / Observer, Factory |
| HU05 | RF06 | Flota, Empresas | AC04, AC05 / EQ-03 | ADR-001, ADR-002 |
| HU06 | RF07 | Rutas, Empresas | AC04, AC05 | ADR-006 / Repository |
| HU07 | RF08, RF09 | Suscripciones, Notificaciones | AC01, AC06 | ADR-008 / Observer, Facade, Adapter |
| HU08 | RF10 | Flota, Seguimiento | AC05 | ADR-006 |
| Transversal | RF11 | Usuarios, API REST | AC04 / EQ-03 | DA03 |

## 7.3 Hoja de Ruta de Implementación (secuencia recomendada)

Esta secuencia replica la metodología de la guía GoPet (de adentro hacia afuera) aplicada a ETA Ayacucho:

```text
SPRINT 0: Fundamentos
  ├── Repositorio Git, ramas y CI (RC02).
  ├── docker-compose con PostgreSQL+PostGIS y Redis.
  └── Esqueleto Express + TypeScript, EventBus y estructura de carpetas por módulo.

SPRINT 1: Red de transporte (HU06, HU01)
  ├── Módulos Usuarios (JWT + roles), Empresas y Rutas.
  ├── Carga de rutas y paradas reales de Ayacucho (CRUD admin).
  └── Consulta de paradas cercanas con PostGIS + Decorator con Redis.

SPRINT 2: Flota y recorridos (HU05, HU04)
  ├── Módulo Flota: vehículos, conductores, asignaciones.
  ├── Recorrido con máquina de estados (RN-05, RN-06, RN-07).
  └── PWA del conductor: inicio/fin de recorrido.

SPRINT 3: Seguimiento en vivo (HU04, HU03)
  ├── Ingesta de posiciones (POST /posiciones) con Redis + TTL.
  ├── PWA del conductor: envío cada 5 s, búfer offline y Wake Lock.
  └── Mapa del pasajero con vehículos en vivo (polling 10 s).

SPRINT 4: Cálculo de ETA (HU02)  ← núcleo del sistema
  ├── Dominio: Coordenada, PosicionVehiculo, EstimacionEta + pruebas unitarias.
  ├── Estrategias: EtaPorVelocidadPromedio primero, luego EtaPorRuteo (OSRM).
  ├── EtaConRespaldo y pruebas de falla (EQ-02).
  └── Calibrar velocidad promedio y factor de rodeo con recorridos de prueba reales.

SPRINT 5: Alertas y reportes (HU07, HU08)
  ├── Favoritos y alertas; Observer sobre PosicionActualizada.
  ├── Notificaciones: Facade + adaptador FCM.
  └── Reporte de puntualidad (ETA estimado vs. llegada real).

SPRINT 6: Endurecimiento
  ├── Pruebas de carga (EQ-01, EQ-05) y de seguridad (EQ-03).
  ├── Rate limiting, cabeceras de seguridad y revisión de privacidad (Ley 29733).
  └── Documentación final y despliegue.
```

## 7.4 Riesgos Principales y Mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El navegador limita la geolocalización con la pantalla apagada | Posiciones intermitentes | Wake Lock API, instrucciones al conductor; evolución a trackers GPS dedicados (ADR-005). |
| Baja adopción por parte de los conductores | Sin datos, sin ETA | Interfaz mínima (un botón de iniciar/finalizar), piloto con una sola ruta y una empresa. |
| Conectividad móvil irregular | Huecos en los datos | Búfer offline, envío en lote, estado SIN_SEÑAL explícito en la interfaz. |
| ETA poco preciso con velocidad fija | Desconfianza del usuario | Mostrar el nivel de confianza; calibrar con histórico; añadir `EtaPorHistorico` (Strategy). |
| Costo o límites del proveedor de mapas | Servicio degradado | OSRM autoalojado, fallback a velocidad promedio, caché corto del ETA. |
| Privacidad de la ubicación del conductor | Incumplimiento legal | Captura solo durante recorrido activo; no exponer la identidad del conductor al pasajero (RC06). |
