# Boilerplate Clean Architecture - ETA Ayacucho

Esqueleto del backend (Node.js + Express + TypeScript) con el módulo **ETA** implementado como referencia.

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # pruebas unitarias del dominio y del caso de uso
```

Probar el ETA con los datos de ejemplo:

```bash
curl "http://localhost:3000/api/v1/paradas/parada-3/eta?rutaId=ruta-demo"
```

No necesitas OSRM, Redis ni PostgreSQL para esta demo. Si OSRM no responde, el sistema usa la estrategia de respaldo y devuelve `"confianza": "BAJA"` (escenario EQ-02). Si levantas un servidor OSRM y defines `OSRM_URL`, devolverá `"confianza": "ALTA"`.

## Qué está real y qué es de ejemplo

| Parte | Estado |
|---|---|
| `src/modules/eta/` completo (dominio, aplicación, infraestructura, presentación) | Implementado |
| `tests/eta/` | Implementado |
| `src/modules/rutas/` y `src/modules/seguimiento/` | **Versión en memoria con datos de ejemplo.** Reemplazar por PostgreSQL/PostGIS y Redis |
| `mapbox-routing.adapter.ts` | Stub opcional |
| Módulos Usuarios, Empresas, Flota, Suscripciones, Notificaciones | **Por crear** con la misma estructura de carpetas |
| `docker-compose.yml` | Listo para cuando conectes PostgreSQL y Redis |

## Cómo crear un módulo nuevo

Copia la estructura de `src/modules/eta/`: `dominio/` (entidades y puertos, sin librerías externas) → `aplicacion/` (casos de uso) → `infraestructura/` (adaptadores) → `presentacion/` (controlador y rutas) → `<modulo>.module.ts` (composición) → `index.ts` (API pública).

Reglas: los módulos solo se importan entre sí por su `index.ts`, y ningún módulo hace SQL sobre tablas de otro.
