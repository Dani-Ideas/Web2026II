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

docker compose up --build      # Construir y levantar app + MySQL
docker compose up -d           # Levantar en background
docker compose down            # Detener y eliminar contenedores
docker compose down -v         # Detener + borrar volumen de datos MySQL
```

---

## Arquitectura de contenedores

```
┌─────────────────────────────────┐
│  docker-compose.yml             │
│                                 │
│  ┌───────────────┐              │
│  │  app          │ :3000→:3000  │
│  │  (Node.js)    │              │
│  │               │──────────────┼──→ http://localhost:3000
│  └───────┬───────┘              │
│          │ red interna          │
│          │ host: "db"           │
│  ┌───────▼───────┐              │
│  │  db           │ :3306        │
│  │  (MySQL 8.0)  │ (solo red    │
│  │               │  interna)    │
│  └───────────────┘              │
│                                 │
│  Volúmenes:                     │
│  db_data   → /var/lib/mysql     │
│  ./public/uploads → /app/public/uploads │
└─────────────────────────────────┘
```

El contenedor `app` espera a que `db` esté `healthy` antes de arrancar (`depends_on: condition: service_healthy`). El healthcheck usa `mysqladmin ping`.

El schema SQL se aplica automáticamente en la **primera creación** del volumen vía `/docker-entrypoint-initdb.d/schema.sql`. En actualizaciones del schema aplicar migraciones manuales (ver sección de migraciones).

---

## Estructura de rutas HTTP

| Método | Ruta | Controlador | Acción |
|---|---|---|---|
| GET | `/` | dashboardController.index | Dashboard |
| GET | `/flota` | fleetController.index | Lista vehículos |
| GET | `/flota/nuevo` | fleetController.create | Form nuevo |
| POST | `/flota` | fleetController.store | Crear vehículo |
| GET | `/flota/:id/editar` | fleetController.edit | Form editar |
| POST | `/flota/:id` | fleetController.update | Actualizar |
| POST | `/flota/:id/eliminar` | fleetController.destroy | Eliminar |
| POST | `/flota/horario/:id/avanzar` | fleetController.advanceSchedule | Avanzar paso mantenimiento |
| GET | `/inspecciones` | inspectionController.index | Lista inspecciones |
| GET | `/inspecciones/nueva` | inspectionController.create | Form inspección |
| POST | `/inspecciones` | inspectionController.store | Guardar inspección |
| GET | `/inspecciones/:id` | inspectionController.show | Detalle inspección |
| GET | `/mantenimiento` | maintenanceController.index | Lista mantenimientos |
| GET | `/mantenimiento/nuevo` | maintenanceController.create | Form nuevo |
| POST | `/mantenimiento` | maintenanceController.store | Crear registro |
| GET | `/mantenimiento/:id/editar` | maintenanceController.edit | Form editar |
| POST | `/mantenimiento/:id` | maintenanceController.update | Actualizar |

> **Nota de orden en router de flota:** la ruta `/flota/horario/:id/avanzar` se declara **antes** de `/:id` para evitar que Express interprete "horario" como un parámetro de ID.

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
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inspecciones diarias
CREATE TABLE inspections (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id    INT NOT NULL,
  driver_name   VARCHAR(120) NOT NULL,
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

### Lógica de derivación de estado desde estrellas

```
rating >= 4  →  pass
rating == 3  →  caution
rating <= 2  →  fail
result       →  'pass' si los 4 campos son 'pass', si no 'fail'
```

---

## Archivos estáticos y subida de fotos

- Express sirve `public/` como raíz estática → `/css/`, `/js/`, `/images/`, `/uploads/`
- Multer guarda fotos en `public/uploads/` con nombre `{timestamp}-{random}.ext`
- Tamaño máximo por archivo: **5 MB**
- Tipos permitidos: `jpeg`, `jpg`, `png`, `webp`
- Hasta **5 fotos** por inspección
- En Docker el directorio está montado como volumen para persistencia entre reinicios

---

## Imágenes de vehículos

| Tipo en BD | Archivo | Dimensiones originales |
|---|---|---|
| camión | `public/images/Trailer.png` | 957 × 231 px |
| furgoneta | `public/images/camioneta.png` | 553 × 273 px |
| automóvil | `public/images/Carro.png` | 502 × 256 px |
| motocicleta | `public/images/Moto.png` | 390 × 231 px |

Las imágenes se muestran con `object-fit: contain` dentro de un contenedor fijo de 200 px de alto, por lo que el Trailer (muy ancho) no desborda.

---

## Seguridad — notas básicas

- Las credenciales de DB se leen exclusivamente de variables de entorno, nunca hardcodeadas.
- Todas las queries usan **parámetros preparados** (`?`) de `mysql2/promise`; no hay concatenación de strings en SQL.
- Multer valida extensión **y** MIME type antes de aceptar el archivo.
- No se implementa autenticación en esta versión. Para producción agregar middleware de sesión (express-session + connect-mysql2) o JWT.
