# ETA Ayacucho: Arquitectura y Diseño de Software

Sistema de estimación de hora de llegada (ETA) para el transporte público urbano de Ayacucho.
Estilo: **Monolito Modular** con **Clean Architecture** (Node.js + Express + TypeScript, Angular PWA, PostgreSQL + PostGIS, Redis).

## Estructura del repositorio

```text
ETA-Ayacucho-arquitSoft/
├── README.md
├── docs/
│   ├── 00-especificacion-maestra-completa.md   # Todo el documento en un solo archivo
│   ├── 01-analisis-de-sistema/                 # Actores, HU, RF, AC, RC, drivers, ADRs, escenarios SEI
│   ├── 02-arquitectura-software/               # Arquitectura inicial, estilo, enfoque, componentes
│   ├── 03-diseño-de-software/diseño-interno/   # Diseño de módulos, patrones, principios SOLID
│   ├── 04-modelo-c4/                           # Niveles 1 a 4 del modelo C4
│   └── 05-pruebas-y-plan/                      # Pruebas, trazabilidad, hoja de ruta y riesgos
├── img/
│   ├── fuentes-puml/                           # Diagramas en PlantUML (fuente editable)
│   └── README.md                               # Cómo generar los PNG
└── tecnologia/
    └── boilerplate-clean-architecture/         # Backend de referencia con el módulo ETA
```

## Orden de lectura sugerido
1. `docs/01-analisis-de-sistema/` (de `01` a `08`)
2. `docs/02-arquitectura-software/`
3. `docs/04-modelo-c4/` (Nivel 1 a Nivel 4)
4. `docs/03-diseño-de-software/diseño-interno/`
5. `docs/05-pruebas-y-plan/`
6. `tecnologia/boilerplate-clean-architecture/`

## Generar los diagramas
Los diagramas están en `img/fuentes-puml/` (PlantUML). Las instrucciones y la tabla de nombres de PNG están en [`img/README.md`](img/README.md). Hasta que exportes los PNG, las imágenes en los `.md` aparecerán rotas.

## Ejecutar el código de referencia
Ver [`tecnologia/boilerplate-clean-architecture/README.md`](tecnologia/boilerplate-clean-architecture/README.md).

## Pendientes por completar
- [ ] Datos del curso, integrantes y docente (esta portada).
- [ ] Validar con datos reales de Ayacucho los supuestos de `docs/02-arquitectura-software/arquitectura-inicial.md` (flota, usuarios, TTL, velocidad promedio).
- [ ] Exportar los PNG de `img/fuentes-puml/` a `img/`.
- [ ] Reemplazar las coordenadas de ejemplo en `src/modules/rutas/index.ts` por paradas reales.
- [ ] Implementar los módulos que faltan (Usuarios, Empresas, Flota, Suscripciones, Notificaciones).
- [ ] Confirmar con el docente el stack y el formato de entrega esperados.
