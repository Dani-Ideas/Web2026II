# FleetOps Command — Documentación Técnica

Referencia para administradores de sistema, DevOps e integradores.

---

## Requisitos de entorno

| Componente | Versión mínima |
|---|---|
| Node.js | 20.x LTS |
| npm | 10.x |
| MySQL | 8.0 |
| Docker | 24.x |
| Docker Compose | 2.x (plugin integrado) |

---

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar:

```env
PORT=3000

DB_HOST=localhost      # "db" cuando se usa Docker Compose
DB_PORT=3306
DB_USER=fleetops
DB_PASSWORD=secret
DB_NAME=fleetops_db
```

En producción sustituir credenciales y asegurar que `.env` **no** se suba a control de versiones (ya está en `.gitignore`).

---

## Comandos disponibles

```bash
npm start          # Producción — node app.js
npm run dev        # Desarrollo — nodemon (recarga automática)

docker compose up --build      # Construir y levantar app + MySQL (requerido al cambiar package.json o Dockerfile)
docker compose up -d           # Levantar en background (sin rebuild)
docker compose down            # Detener y eliminar contenedores
docker compose down -v         # Detener + borrar volumen de datos MySQL
```

---

## Arquitectura de contenedores

```
┌─────────────────────────────────────────────────────┐
│  docker-compose.yml                                  │
│                                                     │
│  ┌───────────────┐                                  │
│  │  app          │ :3000→:3000                      │
│  │  (Node.js)    │──────────────────→ http://localhost:3000
│  └───────┬───────┘                                  │
│          │ red interna (host: "db")                 │
│  ┌───────▼───────┐                                  │
│  │  db           │ :3306 (solo red interna)         │
│  │  (MySQL 8.0)  │                                  │
│  └───────────────┘                                  │
│                                                     │
│  Volúmenes montados (edición en caliente):          │
│  ./views            → /app/views                    │
│  ./public/css       → /app/public/css               │
│  ./public/js        → /app/public/js                │
│  ./controllers      → /app/controllers              │
│  ./routes           → /app/routes                   │
│  ./public/uploads   → /app/public/uploads           │
│  db_data            → /var/lib/mysql                │
└─────────────────────────────────────────────────────┘
```

El contenedor `app` espera a que `db` esté `healthy` antes de arrancar (`depends_on: condition: service_healthy`). El healthcheck usa `mysqladmin ping`.

El schema SQL se aplica automáticamente en la **primera creación** del volumen vía `/docker-entrypoint-initdb.d/schema.sql`. En actualizaciones del schema aplicar migraciones manuales (ver sección de migraciones en README.mantenimiento.md).

**Cuándo se necesita `--build`:** solo al modificar `package.json`, `Dockerfile` o `app.js`. Cambios en vistas, CSS, JS del cliente y controllers se reflejan en tiempo real gracias a los volúmenes montados — basta con reiniciar el contenedor `app` (`docker compose restart app`) o en desarrollo usar `npm run dev` con nodemon.

---

## Estructura de rutas HTTP

| Método | Ruta | Controlador | Acción |
|---|---|---|---|
| GET | `/` | dashboardController.index | Dashboard operativo |
| GET | `/flota` | fleetController.index | Lista vehículos |
| GET | `/flota/nuevo` | fleetController.create | Form nuevo vehículo |
| POST | `/flota` | fleetController.store | Crear vehículo |
| GET | `/flota/:id/historial` | fleetController.historial | Historial inspecciones + mantenimientos |
| GET | `/flota/:id/editar` | fleetController.edit | Form editar vehículo |
| POST | `/flota/:id` | fleetController.update | Actualizar vehículo |
| POST | `/flota/:id/eliminar` | fleetController.destroy | Eliminar vehículo |
| POST | `/flota/horario/:id/avanzar` | fleetController.advanceSchedule | Avanzar paso mantenimiento |
| GET | `/inspecciones` | inspectionController.index | Lista inspecciones |
| GET | `/inspecciones/nueva` | inspectionController.create | Form nueva inspección |
| POST | `/inspecciones` | inspectionController.store | Guardar inspección |
| GET | `/inspecciones/:id` | inspectionController.show | Detalle inspección |
| GET | `/mantenimiento` | maintenanceController.index | Lista + calendario mantenimientos |
| GET | `/mantenimiento/nuevo` | maintenanceController.create | Form nuevo mantenimiento |
| POST | `/mantenimiento` | maintenanceController.store | Crear registro |
| GET | `/mantenimiento/:id/editar` | maintenanceController.edit | Form editar (bloqueado si es programado y futuro) |
| POST | `/mantenimiento/:id` | maintenanceController.update | Actualizar (idem bloqueo) |

> **Nota de orden en router de flota:** las rutas específicas (`/nuevo`, `/horario/:id/avanzar`, `/:id/historial`) se declaran **antes** de `/:id/editar` y `/:id` para evitar que Express interprete los segmentos literales como parámetros de ID.

---

## Esquema de base de datos

```sql
-- Inventario de vehículos
CREATE TABLE vehicles (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  plate            VARCHAR(20)  NOT NULL UNIQUE,
  brand            VARCHAR(60)  NOT NULL,
  model            VARCHAR(60)  NOT NULL,
  year             SMALLINT,
  type             VARCHAR(40),           -- camión | furgoneta | automóvil | motocicleta
  status           ENUM('activo','inactivo','mantenimiento') DEFAULT 'activo',
  fuel_capacity    DECIMAL(6,2),
  insurance_expiry DATE,
  phone            VARCHAR(20),           -- teléfono del dispositivo GPS instalado
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inspecciones diarias
CREATE TABLE inspections (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id    INT NOT NULL,
  driver_name   VARCHAR(120) NOT NULL,
  route         VARCHAR(2),              -- 'A' | 'B' | 'C' (ruta operada)
  engine        ENUM('pass','caution','fail') NOT NULL,
  lights        ENUM('pass','caution','fail') NOT NULL,
  tires         ENUM('pass','caution','fail') NOT NULL,
  safety        ENUM('pass','caution','fail') NOT NULL,
  result        ENUM('pass','fail') NOT NULL,
  engine_rating TINYINT,                 -- 1–5 estrellas
  lights_rating TINYINT,
  tires_rating  TINYINT,
  safety_rating TINYINT,
  notes         TEXT,
  photos        TEXT,                    -- filenames separados por coma
  damage_map    MEDIUMTEXT,              -- canvas base64 con marcas de daño
  signature     MEDIUMTEXT,             -- canvas base64 firma conductor
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Órdenes de mantenimiento
CREATE TABLE maintenance (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id     INT NOT NULL,
  type           ENUM('preventivo','correctivo','predictivo') DEFAULT 'preventivo',
  description    TEXT NOT NULL,
  cost           DECIMAL(10,2) DEFAULT 0.00,
  status         ENUM('pendiente','en_progreso','completado') DEFAULT 'pendiente',
  scheduled_date DATE,
  completed_date DATE,
  is_programmed  TINYINT NOT NULL DEFAULT 0,  -- 1 = generado por maintenance_schedules
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Programación periódica de mantenimiento
CREATE TABLE maintenance_schedules (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id    INT NOT NULL UNIQUE,     -- 1 programación por vehículo
  trigger_type  ENUM('distance','time') NOT NULL,
  trigger_value INT NOT NULL,            -- km o días
  program_id    TINYINT NOT NULL,        -- 1, 2 o 3
  current_step  TINYINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
```

### Columnas agregadas por migraciones

Las siguientes columnas se añadieron con `ALTER TABLE` sobre la BD existente y deben incluirse en cualquier instalación nueva vía `schema.sql`:

| Tabla | Columna | Tipo | Propósito |
|---|---|---|---|
| `vehicles` | `phone` | `VARCHAR(20)` | Teléfono del GPS instalado en el vehículo |
| `inspections` | `route` | `VARCHAR(2)` | Ruta seleccionada al inicio de la inspección (A/B/C) |
| `maintenance` | `is_programmed` | `TINYINT NOT NULL DEFAULT 0` | Indica si el registro fue generado automáticamente |

### Lógica de derivación de estado desde estrellas

```
rating >= 4  →  pass
rating == 3  →  caution
rating <= 2  →  fail
result       →  'pass' si los 4 campos son 'pass', si no 'fail'
```

---

## Dashboard — queries y KPIs

El controlador `dashboardController.index` ejecuta 6 queries en paralelo con `Promise.all`:

| Query | Propósito |
|---|---|
| `vStats` | Conteo de vehículos por estado (`activo`, `mantenimiento`, `total`) |
| `pendingInsp` | Vehículos activos sin inspección registrada hoy (`CURDATE()`) |
| `chartRows` | Conteo `pass`/`fail` por día de los últimos 7 días |
| `expiringIns` | Vehículos con `insurance_expiry` entre hoy y +30 días |
| `failedInsp` | Últimas inspecciones con `result = 'fail'` |
| `fleetList` | Hasta 10 vehículos con última inspección, ruta y próximo servicio (subconsultas correlacionadas) |

La disponibilidad se calcula en el controller:
```javascript
const availability = vStats.total > 0
  ? Math.round((vStats.active / vStats.total) * 100)
  : 0;
```

La gráfica de 7 días se construye rellenando los días sin datos con `{ pass_count: 0, fail_count: 0 }`:
```javascript
const chartData = last7Days.map(d => chartMap[d] || { pass_count: 0, fail_count: 0 });
```

---

## Mantenimiento — comportamiento automático

### syncProgrammedMaintenances()

Esta función se ejecuta al inicio de cada carga de `GET /mantenimiento`. Es idempotente: antes de insertar verifica si ya existe un registro programado pendiente para ese vehículo.

Alcance actual: solo cubre `trigger_type = 'time'` (días). Los vehículos con criterio por distancia (km) requieren avance manual desde la pantalla de edición del vehículo.

La `scheduled_date` del nuevo registro se calcula como:
```
maintenance_schedules.updated_at + trigger_value días
```

### Bloqueo de registros programados

En `maintenanceController.edit` y `update`, si el registro tiene `is_programmed = 1` y su `scheduled_date` es posterior a hoy, el sistema rechaza la edición y redirige sin guardar.

### Auto-avance de secuencia al completar

Cuando se marca un registro programado como `completado`, el controller:
1. Consulta `maintenance_schedules` del vehículo.
2. Incrementa `current_step` en 1 (con módulo sobre la longitud del programa).
3. La próxima carga de `GET /mantenimiento` generará el siguiente registro automáticamente.

---

## Archivos estáticos y subida de fotos

- Express sirve `public/` como raíz estática → `/css/`, `/js/`, `/images/`, `/uploads/`
- Multer guarda fotos en `public/uploads/` con nombre `{timestamp}-{random}.ext`
- Tamaño máximo por archivo: **5 MB**
- Tipos permitidos: `jpeg`, `jpg`, `png`, `webp`
- Hasta **5 fotos** por inspección
- El directorio está montado como volumen Docker para persistencia entre reinicios

---

## Imágenes de vehículos

| Tipo en BD | Archivo | Dimensiones originales |
|---|---|---|
| camión | `public/images/Trailer.png` | 957 × 231 px |
| furgoneta | `public/images/camioneta.png` | 553 × 273 px |
| automóvil | `public/images/Carro.png` | 502 × 256 px |
| motocicleta | `public/images/Moto.png` | 390 × 231 px |

Las imágenes se muestran con `object-fit: contain` dentro de un contenedor fijo de 200 px de alto. El canvas de daños es transparente y se posiciona encima con `position: absolute`.

---

## Seguridad — notas básicas

- Las credenciales de DB se leen exclusivamente de variables de entorno, nunca hardcodeadas.
- Todas las queries usan **parámetros preparados** (`?`) de `mysql2/promise`; no hay concatenación de strings en SQL.
- Multer valida extensión **y** MIME type antes de aceptar el archivo.
- Los campos `damage_map` y `signature` (base64 MEDIUMTEXT) se excluyen de todas las queries de listado; solo se cargan en el detalle individual para evitar transferir 50–80 KB por registro en tablas.
- No se implementa autenticación en esta versión. Para producción agregar middleware de sesión (express-session + connect-mysql2) o JWT.
