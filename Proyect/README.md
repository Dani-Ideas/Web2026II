# FleetOps Command

Sistema integral de gestión e inspección de flota vehicular de transporte.

## Descripción

FleetOps Command permite registrar vehículos, ejecutar inspecciones diarias con checklist digitalizado y firma, gestionar el mantenimiento preventivo y correctivo, y consultar métricas operativas en un dashboard en tiempo real. Está diseñado para entornos logísticos de alta exigencia.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Servidor | Node.js 20 + Express 4 |
| Plantillas | EJS (Embedded JavaScript) |
| Base de datos | MySQL 8.0 |
| Subida de archivos | Multer 2.x |
| Infraestructura | Docker + Docker Compose |
| Frontend | HTML5 · CSS3 vanilla · JavaScript ES6 |

## Flujo del sistema

```
Usuario
  │
  ├─ GET /               → Dashboard (métricas, últimas inspecciones)
  │
  ├─ GET /flota          → Lista de vehículos (filtro placa/marca/estado)
  │    ├─ GET /flota/nuevo        → Formulario crear vehículo + programar mantenimiento periódico
  │    └─ GET /flota/:id/editar   → Formulario editar + progreso de secuencia de mantenimiento
  │
  ├─ GET /inspecciones   → Historial de inspecciones
  │    ├─ GET /inspecciones/nueva → Formulario (carrusel 4 categorías + mapa de daños)
  │    └─ GET /inspecciones/:id   → Detalle con fotos, firma y mapa de daños
  │
  └─ GET /mantenimiento  → Registro de mantenimientos (historial + calendario)
       ├─ GET /mantenimiento/nuevo
       └─ GET /mantenimiento/:id/editar

Solicitud HTTP
  → Express Router (routes/)
      → Controller (controllers/)
          → MySQL Pool (config/db.js)
              ← Resultado
          → Multer (config/multer.js)   ← solo en rutas con archivos
      → EJS render (views/)
  → Respuesta HTML
```

## Módulos

| Módulo | Ruta | Descripción |
|---|---|---|
| Dashboard | `/` | Contadores en tiempo real + tabla de inspecciones recientes |
| Flota | `/flota` | CRUD completo de vehículos + programación de mantenimiento periódico con secuencias |
| Inspecciones | `/inspecciones` | Formulario de inspección diaria con carrusel de categorías, calificación por estrellas, mapa de daños, firma digital y evidencia fotográfica |
| Mantenimiento | `/mantenimiento` | Registro de mantenimientos preventivos, correctivos y predictivos con calendario |

## Base de datos — tablas principales

```
vehicles               → Inventario de flota
inspections            → Registros de inspección diaria
maintenance            → Órdenes de mantenimiento
maintenance_schedules  → Programación periódica por vehículo (secuencia + criterio)
```

## Inicio rápido

```bash
# Con Docker (recomendado)
docker compose up --build
# Acceder en http://localhost:3000

# Local (requiere MySQL corriendo)
cp .env.example .env   # editar credenciales
npm install
npm run dev
```

## Documentación adicional

| Audiencia | Documento |
|---|---|
| Usuario final (operador, conductor) | [docs/README.usuario.md](docs/README.usuario.md) |
| Perfil técnico (administrador, DevOps) | [docs/README.tecnico.md](docs/README.tecnico.md) |
| Programador / mantenimiento / escalabilidad | [docs/README.mantenimiento.md](docs/README.mantenimiento.md) |
