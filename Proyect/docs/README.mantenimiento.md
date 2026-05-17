# FleetOps Command — Guía de Mantenimiento, Extensión y Escalabilidad

Este documento está dirigido a la persona que tomará este proyecto para darle mantenimiento, agregar funcionalidades o escalarlo. Se asume que puede tener cualquier nivel de experiencia con Node.js, por lo que cada concepto se explica desde cero con ejemplos concretos.

---

## Índice

1. [Cómo está organizado el proyecto](#1-cómo-está-organizado-el-proyecto)
2. [Cómo funciona la aplicación por dentro](#2-cómo-funciona-la-aplicación-por-dentro)
3. [Base de datos — entender y modificar el schema](#3-base-de-datos--entender-y-modificar-el-schema)
4. [Cómo agregar una nueva página o módulo](#4-cómo-agregar-una-nueva-página-o-módulo)
5. [Cómo modificar el formulario de inspección](#5-cómo-modificar-el-formulario-de-inspección)
6. [Cómo funciona la programación de mantenimiento periódico](#6-cómo-funciona-la-programación-de-mantenimiento-periódico)
7. [Cómo funciona la subida de fotos](#7-cómo-funciona-la-subida-de-fotos)
8. [Cómo funciona el mapa de daños y la firma digital](#8-cómo-funciona-el-mapa-de-daños-y-la-firma-digital)
9. [Cómo modificar el sistema de diseño (colores, tipografía)](#9-cómo-modificar-el-sistema-de-diseño-colores-tipografía)
10. [Cómo agregar un nuevo tipo de vehículo con su imagen](#10-cómo-agregar-un-nuevo-tipo-de-vehículo-con-su-imagen)
11. [Migraciones de base de datos](#11-migraciones-de-base-de-datos)
12. [Docker — producción y operación](#12-docker--producción-y-operación)
13. [Escalabilidad — qué cambiar cuando crezca](#13-escalabilidad--qué-cambiar-cuando-crezca)
14. [Errores comunes y cómo resolverlos](#14-errores-comunes-y-cómo-resolverlos)
15. [Convenciones de código del proyecto](#15-convenciones-de-código-del-proyecto)

---

## 1. Cómo está organizado el proyecto

```
Proyect/
│
├── app.js                  ← Punto de entrada. Aquí arranca Express.
├── package.json            ← Dependencias y scripts npm.
├── .env                    ← Variables de entorno (NO subir a git).
├── .env.example            ← Plantilla de .env para nuevos entornos.
├── Dockerfile              ← Receta para construir la imagen Docker.
├── docker-compose.yml      ← Orquesta app + base de datos.
│
├── config/
│   ├── db.js               ← Pool de conexiones MySQL. Lo importan los controllers.
│   └── multer.js           ← Configuración de subida de archivos.
│
├── routes/
│   ├── dashboard.js        ← Rutas de /
│   ├── fleet.js            ← Rutas de /flota
│   ├── inspections.js      ← Rutas de /inspecciones
│   └── maintenance.js      ← Rutas de /mantenimiento
│
├── controllers/
│   ├── dashboardController.js
│   ├── fleetController.js
│   ├── inspectionController.js
│   └── maintenanceController.js
│
├── views/                  ← Plantillas EJS (HTML con código JS embebido)
│   ├── partials/           ← Fragmentos reutilizables
│   │   ├── head.ejs        ← <head> con CSS y fuentes
│   │   ├── sidebar.ejs     ← Menú lateral
│   │   └── topbar.ejs      ← Barra superior con título
│   ├── dashboard/index.ejs
│   ├── fleet/
│   │   ├── index.ejs       ← Lista de vehículos
│   │   └── form.ejs        ← Crear / editar vehículo
│   ├── inspections/
│   │   ├── form.ejs        ← Formulario de inspección (carrusel)
│   │   ├── index.ejs       ← Historial
│   │   └── show.ejs        ← Detalle de una inspección
│   ├── maintenance/
│   │   ├── index.ejs
│   │   └── form.ejs
│   └── error.ejs           ← Página de error genérica
│
├── public/                 ← Archivos estáticos servidos directamente al browser
│   ├── css/style.css       ← TODA la hoja de estilos del proyecto
│   ├── js/signature.js     ← (legado, la lógica actual está inline en form.ejs)
│   ├── images/             ← Imágenes de tipos de vehículo
│   └── uploads/            ← Fotos subidas por usuarios
│
└── database/
    └── schema.sql          ← Definición completa de tablas
```

---

## 2. Cómo funciona la aplicación por dentro

### El ciclo completo de una solicitud

Cuando el usuario abre `http://servidor:3000/flota` en el navegador:

```
Browser → GET /flota
  ↓
app.js  → app.use('/flota', fleetRoutes)
  ↓
routes/fleet.js → router.get('/', fleetController.index)
  ↓
controllers/fleetController.js → exports.index = async (req, res, next) => {
    const [vehicles] = await db.query('SELECT * FROM vehicles ...');
    res.render('fleet/index', { title: '...', vehicles, ... });
  }
  ↓
views/fleet/index.ejs  ← EJS reemplaza <%= vehicles %> con datos reales
  ↓
Browser ← HTML generado
```

### ¿Qué es EJS?

EJS es un sistema de plantillas. Es HTML normal, pero puede incluir bloques de JavaScript entre `<% %>`:

```ejs
<% vehicles.forEach(v => { %>          ← código JS, no genera HTML
  <tr>
    <td><%= v.plate %></td>            ← imprime el valor de v.plate
    <td><%- v.html_content %></td>     ← imprime HTML sin escapar (con cuidado)
  </tr>
<% }) %>
```

- `<% %>` — ejecuta código, no imprime nada.
- `<%= %>` — imprime el valor (escapa HTML para seguridad).
- `<%- %>` — imprime el valor sin escapar (solo usar para HTML de confianza).
- `<%- include('partials/head') %>` — incluye otro archivo EJS.

### ¿Qué es el pool de conexiones MySQL?

`config/db.js` crea un **pool** de conexiones. Esto significa que en vez de abrir y cerrar una conexión por cada query, mantiene un grupo de conexiones listas. Los controllers simplemente hacen:

```javascript
const [rows] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
// rows es un array de objetos: [{ id:1, plate:'ABC123', ... }]
```

El `?` es un **parámetro preparado**. mysql2 lo reemplaza de forma segura, evitando inyección SQL. **Nunca concatenar variables directamente en strings SQL.**

---

## 3. Base de datos — entender y modificar el schema

### Ver el estado actual de la BD en Docker

```bash
# Entrar al contenedor de MySQL
docker exec -it proyect-db-1 mysql -ufleetops -psecret fleetops_db

# Dentro de MySQL:
SHOW TABLES;
DESCRIBE vehicles;
SELECT * FROM maintenance_schedules;
EXIT;
```

### Agregar una columna nueva

Ejemplo: agregar `odometer` (kilometraje) a `vehicles`:

**Paso 1 — Aplicar en la BD corriendo:**
```sql
-- Ejecutar en MySQL
ALTER TABLE vehicles ADD COLUMN odometer INT DEFAULT NULL COMMENT 'Kilometraje actual';
```

Con Docker:
```bash
docker exec -i proyect-db-1 mysql -ufleetops -psecret fleetops_db -e \
  "ALTER TABLE vehicles ADD COLUMN odometer INT DEFAULT NULL;"
```

**Paso 2 — Actualizar `database/schema.sql`** para que las instalaciones futuras incluyan la columna:
```sql
-- Dentro de CREATE TABLE vehicles, agregar:
odometer INT DEFAULT NULL,
```

**Paso 3 — Usar la columna en el controller:**
```javascript
// En fleetController.js, función store:
const { plate, brand, ..., odometer } = req.body;
await db.query(
  'INSERT INTO vehicles (plate, brand, ..., odometer) VALUES (?, ?, ..., ?)',
  [plate, brand, ..., odometer || null]
);
```

**Paso 4 — Mostrar en la vista EJS:**
```ejs
<div class="form__group">
  <label class="form__label">Kilometraje actual</label>
  <input type="number" name="odometer" class="input"
    value="<%= vehicle ? vehicle.odometer : '' %>" />
</div>
```

---

## 4. Cómo agregar una nueva página o módulo

Supongamos que queremos agregar un módulo de **Conductores** (`/conductores`).

### Paso 1 — Crear la tabla en la BD

```sql
-- En database/schema.sql, agregar:
CREATE TABLE IF NOT EXISTS drivers (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  license    VARCHAR(40),
  phone      VARCHAR(20),
  status     ENUM('activo','inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Aplicar en la BD corriendo:
```bash
docker exec -i proyect-db-1 mysql -ufleetops -psecret fleetops_db < database/schema.sql
```
(Si la tabla ya existe, el `IF NOT EXISTS` evita error.)

### Paso 2 — Crear el archivo de rutas

Crear `routes/drivers.js`:
```javascript
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/driverController');

router.get('/',            ctrl.index);
router.get('/nuevo',       ctrl.create);
router.post('/',           ctrl.store);
router.get('/:id/editar',  ctrl.edit);
router.post('/:id',        ctrl.update);
router.post('/:id/eliminar', ctrl.destroy);

module.exports = router;
```

### Paso 3 — Crear el controller

Crear `controllers/driverController.js`:
```javascript
const db = require('../config/db');

exports.index = async (req, res, next) => {
  try {
    const [drivers] = await db.query('SELECT * FROM drivers ORDER BY name');
    res.render('drivers/index', { title: 'Conductores', drivers });
  } catch (err) { next(err); }
};

exports.create = (req, res) => {
  res.render('drivers/form', { title: 'Nuevo Conductor', driver: null });
};

exports.store = async (req, res, next) => {
  try {
    const { name, license, phone, status } = req.body;
    await db.query(
      'INSERT INTO drivers (name, license, phone, status) VALUES (?, ?, ?, ?)',
      [name, license, phone, status]
    );
    res.redirect('/conductores');
  } catch (err) { next(err); }
};

// edit, update, destroy siguen el mismo patrón que fleetController
```

### Paso 4 — Registrar la ruta en app.js

En `app.js`, agregar antes del middleware de 404:
```javascript
const driverRoutes = require('./routes/drivers');
app.use('/conductores', driverRoutes);
```

### Paso 5 — Crear las vistas

Crear el directorio `views/drivers/` y los archivos `index.ejs` y `form.ejs`. Copiar la estructura de `views/fleet/index.ejs` como punto de partida y adaptar los campos.

### Paso 6 — Agregar al menú lateral

En `views/partials/sidebar.ejs`, agregar un nuevo enlace:
```ejs
<a href="/conductores" class="sidebar__link
  <%= typeof currentPage !== 'undefined' && currentPage === 'drivers' ? 'sidebar__link--active' : '' %>">
  <span class="sidebar__icon">👤</span> Conductores
</a>
```

Y en cada vista del nuevo módulo, pasar `currentPage: 'drivers'` al render:
```javascript
res.render('drivers/index', { title: 'Conductores', drivers, currentPage: 'drivers' });
```

---

## 5. Cómo modificar el formulario de inspección

El formulario está en `views/inspections/form.ejs`. Es el archivo más complejo del proyecto.

### Estructura del carrusel

El carrusel funciona con CSS `transform: translateX`. Cada slide ocupa el 100% del ancho del contenedor. El track (contenedor interno) se mueve horizontalmente:

```
car-wrap (overflow: hidden)
  └── car-track (display: flex; width: 400%)
        ├── car-slide 1 (min-width: 100%)
        ├── car-slide 2 (min-width: 100%)
        ├── car-slide 3 (min-width: 100%)
        └── car-slide 4 (min-width: 100%)

Al ir al slide 2: car-track.style.transform = 'translateX(-100%)'
Al ir al slide 3: car-track.style.transform = 'translateX(-200%)'
```

### Agregar una nueva categoría al carrusel

1. **En el HTML del carrusel**, copiar un bloque `<div class="car-slide">` y modificar:
   - El gradiente del hero (cambiar colores en `style="background:..."`).
   - El ícono emoji.
   - El número de categoría (`Categoría 5 / 5`).
   - El título.
   - Los ítems del checklist dentro de `car-slide__body`.
   - El ID de estrellas (`id="starsNew"`) y el nombre del campo (`name="new_rating"`).
   - El ID del botón siguiente (`id="nextBtn4"`).

2. **Agregar un punto más en los dots:**
```html
<button type="button" class="car-dot" onclick="goToSlide(4)"></button>
```

3. **Actualizar `TOTAL = 5`** en el bloque `<script>`.

4. **Agregar la columna en la base de datos:**
```sql
ALTER TABLE inspections ADD COLUMN new_rating TINYINT DEFAULT NULL;
```

5. **Actualizar el controller** `store` para recibir y guardar `new_rating`.

6. **Agregar la lógica de derivación** en `ratingToStatus` si aplica.

### Agregar un ítem nuevo a una categoría existente

Solo agregar un nuevo `<label class="chk-row">` dentro del `car-slide__body` correspondiente. Los checkboxes se envían como array (`name="engine_items[]"`), actualmente no se almacenan en BD, solo sirven de guía visual para llegar a la calificación de estrellas.

Si se quiere guardarlos: agregar una columna `engine_items TEXT` en inspections, y en el controller:
```javascript
const engineItems = Array.isArray(req.body['engine_items[]'])
  ? req.body['engine_items[]'].join(',')
  : req.body['engine_items[]'] || '';
```

---

## 6. Cómo funciona la programación de mantenimiento periódico

### Las tres secuencias predefinidas

En `controllers/fleetController.js`, al tope del archivo:

```javascript
const PROGRAMS = {
  1: ['Afinación','Afinación','Afinación','Medio Ajuste','Afinación','Afinación','Afinación','Ajuste'],
  2: ['Afinación','Afinación','Afinación','Afinación','Afinación','Afinación','Afinación','Afinación','Ajuste'],
  3: ['Afinación','Afinación','Afinación','Medio Ajuste','Afinación','Afinación','Afinación','Medio Ajuste'],
};
```

La tabla `maintenance_schedules` almacena `current_step` (qué posición en el array es el próximo mantenimiento a realizar).

### Ciclo de vida de un paso

```
Vehículo asignado a Programación 1 → current_step = 0
                                     próximo = PROGRAMS[1][0] = 'Afinación'

Conductor completa el mantenimiento → POST /flota/horario/:id/avanzar
                                     current_step = 1
                                     próximo = PROGRAMS[1][1] = 'Afinación'

... (pasos 2, 3) ...

current_step = 3  → próximo = 'Medio Ajuste'
current_step = 7  → próximo = 'Ajuste'
current_step = 8  → 8 % 8 = 0 → vuelve al inicio del ciclo ('Afinación')
```

El módulo usa `% prog.length` para que sea un ciclo infinito.

### Agregar una nueva secuencia (Programación 4)

1. En `controllers/fleetController.js`, agregar al objeto `PROGRAMS`:
```javascript
4: ['Afinación','Afinación','Medio Ajuste','Afinación','Afinación','Ajuste'],
```

2. En `views/fleet/form.ejs`, el carrusel de programas se genera automáticamente con `Object.entries(PROGRAMS)`, así que aparecerá sin más cambios.

3. Si `program_id` en la BD es `TINYINT`, soporta hasta 127 — no requiere cambio de schema.

### Cambiar el criterio de activación de distancia a días sin perder datos

La tabla `maintenance_schedules` tiene `trigger_type ENUM('distance','time')`. Para cambiar el criterio de un vehículo específico, simplemente editar el vehículo en `/flota/:id/editar` y guardar con el nuevo criterio seleccionado — el `current_step` se **resetea a 0** por diseño (el upsert hace `program_id=VALUES(program_id)` pero no toca `current_step` en el UPDATE... verificar si se desea preservar el paso actual; si sí, modificar el query en `update` para no resetear `current_step`).

---

## 7. Cómo funciona la subida de fotos

### Flujo completo

```
form.ejs: <input type="file" name="evidencia" multiple />
    ↓ multipart/form-data POST /inspecciones
routes/inspections.js: upload.array('evidencia', 5)
    ↓ Multer intercepta los archivos
config/multer.js:
  - Valida tipo: jpeg/jpg/png/webp (por extensión Y por mimetype)
  - Valida tamaño: máx 5 MB por archivo
  - Genera nombre: `{Date.now()}-{random}.{ext}`
  - Guarda en: /app/public/uploads/ (Docker) o ./public/uploads/ (local)
    ↓
controllers/inspectionController.js:
  const photos = req.files ? req.files.map(f => f.filename).join(',') : '';
  // photos = "1716000000000-123.jpg,1716000000001-456.png"
    ↓
MySQL: INSERT ... photos = '1716000000000-123.jpg,1716000000001-456.png'
    ↓
views/inspections/show.ejs:
  <% inspection.photos.split(',').forEach(photo => { %>
    <img src="/uploads/<%= photo %>" />
  <% }) %>
```

### Cambiar el límite de fotos o el tamaño máximo

En `config/multer.js`:
```javascript
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }  // cambiar a 10 MB
});
```

En `routes/inspections.js`:
```javascript
upload.array('evidencia', 10)  // cambiar a máx 10 archivos
```

### Agregar subida de fotos a otro módulo (ej. mantenimiento)

1. Importar multer en el router:
```javascript
const { upload } = require('../config/multer');
router.post('/', upload.array('fotos', 3), maintenanceController.store);
```

2. Agregar columna `photos TEXT` a la tabla `maintenance`.

3. En el controller, procesar `req.files`.

4. En el formulario EJS, agregar `enctype="multipart/form-data"` al `<form>` y el campo `<input type="file">`.

---

## 8. Cómo funciona el mapa de daños y la firma digital

Ambos utilizan el elemento `<canvas>` de HTML5, que permite dibujar con JavaScript.

### Mapa de daños

```javascript
// En form.ejs (script inline):
const damageCanvas = document.getElementById('damageCanvas');
const damageCtx    = damageCanvas.getContext('2d');
const marks        = [];   // Array de {x, y} — posiciones de los círculos

// Al hacer click sobre el canvas:
damageCanvas.addEventListener('click', function(e) {
  const rect = damageCanvas.getBoundingClientRect();
  marks.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  redrawMarks();   // Borra y redibuja todos los círculos
  saveDamageMap(); // Convierte el canvas a base64 y lo guarda en el input hidden
});

function redrawMarks() {
  damageCtx.clearRect(0, 0, damageCanvas.width, damageCanvas.height);
  marks.forEach(({x, y}, idx) => {
    damageCtx.arc(x, y, 18, 0, Math.PI * 2);
    damageCtx.strokeStyle = '#ba1a1a';
    // ... dibuja círculo y número
  });
}

function saveDamageMap() {
  // toDataURL() convierte el canvas a una cadena como:
  // "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  document.getElementById('damageMapData').value = damageCanvas.toDataURL();
}
```

La imagen del vehículo (fondo) se muestra como `<img>` separado, **no** sobre el canvas. El canvas es transparente y está posicionado encima con `position: absolute`. De esta forma los círculos se dibujan visualmente sobre la imagen pero el canvas solo contiene los círculos, no la imagen.

Cuando se guarda: solo el canvas (con los círculos) se almacena como base64 en `inspections.damage_map`. La imagen del vehículo se puede reconstruir desde el tipo de vehículo.

### Firma digital

Mismo principio pero en lugar de círculos, dibuja líneas continuas siguiendo el movimiento del mouse:

```javascript
sigCanvas.addEventListener('mousemove', e => {
  if (!drawing) return;
  sigCtx.lineTo(x, y);   // Dibuja línea hasta la posición actual
  sigCtx.stroke();
});
```

Se guarda como base64 en `inspections.signature`.

**Para mostrar la imagen en el detalle** (show.ejs):
```ejs
<img src="<%= inspection.signature %>" alt="Firma" />
<!-- src puede ser un data:URL, el browser lo renderiza directamente -->
```

### Por qué usar base64 en lugar de archivos

El canvas no genera un archivo directamente; solo puede exportar como data URL (`data:image/png;base64,...`). Guardar esto en la BD es más simple que generar un archivo, aunque ocupa más espacio en la base de datos. Para un volumen alto de inspecciones, considerar convertir el base64 a un archivo PNG real con una librería como `canvas` o recibir la imagen en el servidor y procesarla.

---

## 9. Cómo modificar el sistema de diseño (colores, tipografía)

Todos los estilos están en un solo archivo: `public/css/style.css`.

### Variables CSS (tokens de diseño)

Al principio del archivo está el bloque `:root` con todas las variables:

```css
:root {
  --navy:       #1a2b3c;   ← Color principal: azul marino
  --navy-dark:  #041627;   ← Variante oscura del navy
  --orange:     #fd8b00;   ← Naranja de acción (Safety Orange)
  --surface:    #f8f9ff;   ← Fondo general de la página
  --white:      #ffffff;
  ...
}
```

Para cambiar el color de acción principal de toda la app de naranja a, por ejemplo, azul eléctrico:
```css
--orange: #2563eb;
```

Ese cambio se propaga automáticamente a todos los botones de acción, la barra de progreso, los dots del carrusel, etc.

### Agregar un nuevo componente con el estilo del proyecto

Seguir el patrón BEM (Block-Element-Modifier) que ya usa el archivo:
```css
/* Bloque */
.mi-componente { ... }

/* Elemento */
.mi-componente__titulo { ... }
.mi-componente__cuerpo { ... }

/* Modificador */
.mi-componente--destacado { background: var(--navy); }
```

### Cambiar la fuente tipográfica

En `views/partials/head.ejs`:
```html
<!-- Cambiar la URL de Google Fonts: -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
```

En `public/css/style.css`, cambiar la propiedad `font-family` en el `body`:
```css
body { font-family: 'Roboto', sans-serif; ... }
```

---

## 10. Cómo agregar un nuevo tipo de vehículo con su imagen

### Paso 1 — Preparar la imagen

- Formato: PNG con fondo transparente (RGBA), vista lateral del vehículo.
- Ancho recomendado: entre 400 y 700 px. Mayor que 900 px funcionará igual pero carga más lento.
- Guardar en: `public/images/MiVehiculo.png`

### Paso 2 — Copiar la imagen al contenedor Docker

```bash
docker cp public/images/MiVehiculo.png proyect-app-1:/app/public/images/
```

### Paso 3 — Agregar el tipo en el formulario de flota

En `views/fleet/form.ejs`, dentro del `<select name="type">`:
```html
<option value="remolque" <%= vehicle && vehicle.type === 'remolque' ? 'selected' : '' %>>Remolque</option>
```

### Paso 4 — Conectar el tipo con la imagen en el mapa de daños

En `views/inspections/form.ejs`, en el bloque `<script>`:
```javascript
const IMAGE_MAP = {
  'camión':      '/images/Trailer.png',
  'furgoneta':   '/images/camioneta.png',
  'automóvil':   '/images/Carro.png',
  'motocicleta': '/images/Moto.png',
  'remolque':    '/images/MiVehiculo.png',  // ← Agregar aquí
};
```

---

## 11. Migraciones de base de datos

Este proyecto no usa un framework de migraciones (como Flyway o Liquibase). Las migraciones se hacen manualmente.

### Procedimiento estándar

1. Escribir el SQL de migración.
2. Aplicarlo en la BD corriendo.
3. Actualizar `database/schema.sql` para que nuevas instalaciones lo incluyan.
4. Actualizar controllers y vistas.
5. Documentar el cambio (puede ser un comentario en `schema.sql` o en el historial de git).

### Ejemplo de migración aplicada en Docker

```bash
docker exec -i proyect-db-1 mysql -ufleetops -psecret fleetops_db <<'SQL'
ALTER TABLE vehicles
  ADD COLUMN odometer     INT     DEFAULT NULL,
  ADD COLUMN last_service DATE    DEFAULT NULL;
SQL
```

### Revertir una migración

MySQL no tiene rollback de DDL automático. Para revertir:
```bash
docker exec -i proyect-db-1 mysql -ufleetops -psecret fleetops_db -e \
  "ALTER TABLE vehicles DROP COLUMN odometer, DROP COLUMN last_service;"
```

### Recrear la BD desde cero (desarrollo)

```bash
# Borra el volumen y lo recrea con schema.sql limpio
docker compose down -v
docker compose up -d
```

**Advertencia:** esto borra todos los datos. Solo en desarrollo.

---

## 12. Docker — producción y operación

### Reconstruir la imagen después de cambios en dependencias

```bash
docker compose up --build
```

Necesario siempre que se modifique `package.json` o `Dockerfile`.

### Ver logs en tiempo real

```bash
docker compose logs -f app    # Solo la app Node.js
docker compose logs -f db     # Solo MySQL
docker compose logs -f        # Ambos
```

### Acceder a la shell del contenedor

```bash
docker exec -it proyect-app-1 sh    # Shell de la app
docker exec -it proyect-db-1 bash   # Shell de MySQL
```

### Hacer backup de la base de datos

```bash
docker exec proyect-db-1 \
  mysqldump -ufleetops -psecret fleetops_db \
  > backup-$(date +%Y%m%d).sql
```

### Restaurar backup

```bash
docker exec -i proyect-db-1 \
  mysql -ufleetops -psecret fleetops_db \
  < backup-20260517.sql
```

### Cambiar el puerto público de la app

En `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"   # Ahora accesible en :8080 del host
```

### Agregar reinicio automático

En `docker-compose.yml`, dentro del servicio `app`:
```yaml
restart: unless-stopped
```

Esto hace que el contenedor se reinicie automáticamente si el servidor se reinicia o la app falla.

---

## 13. Escalabilidad — qué cambiar cuando crezca

### Si aumentan los usuarios simultáneos

**Problema:** Node.js es de un solo hilo. Con muchas solicitudes simultáneas puede congestionarse.

**Solución 1 — Aumentar el pool de conexiones MySQL:**
En `config/db.js`:
```javascript
const pool = mysql.createPool({
  ...
  connectionLimit: 25,   // subir de 10 a 25 o más
});
```

**Solución 2 — Múltiples instancias con un balanceador de carga:**
Agregar Nginx como proxy inverso con múltiples instancias de la app:
```yaml
# docker-compose.yml (ejemplo simplificado)
app:
  deploy:
    replicas: 3
nginx:
  image: nginx
  # configurar upstream a las 3 instancias
```

### Si el almacenamiento de fotos crece mucho

Las fotos se guardan en `public/uploads/` dentro del contenedor, montado como volumen local. Si la carpeta crece mucho:

- **Opción A:** Montar el volumen en un disco de mayor capacidad.
- **Opción B:** Migrar a almacenamiento en la nube (AWS S3, Cloudflare R2). Instalar `@aws-sdk/client-s3` y modificar `config/multer.js` para usar `multer-s3` en lugar de diskStorage.

### Si el base64 de firmas y mapas de daños pesa mucho en MySQL

Un canvas de 380×130 px como base64 ocupa aprox. 50–80 KB por firma. Para 10.000 inspecciones = 500–800 MB solo en firmas.

**Solución:** Convertir el base64 a archivo PNG en el servidor al recibir el POST, guardar el nombre del archivo en BD, y servir el archivo estáticamente. El campo `MEDIUMTEXT` de MySQL soporta hasta 16 MB, así que no hay problema inmediato, pero sí de performance en consultas.

### Si se necesita autenticación

Actualmente el sistema no tiene login. Para agregar:

1. Instalar: `npm install express-session bcryptjs connect-mysql2`
2. Crear tabla `users` (id, email, password_hash, role).
3. Crear `routes/auth.js` con GET/POST `/login` y GET `/logout`.
4. Agregar middleware de autenticación en `app.js` antes de las rutas protegidas.
5. Almacenar sesiones en MySQL para que persistan si el contenedor se reinicia.

### Si se necesita una API REST (para una app móvil, por ejemplo)

Express puede devolver JSON además de HTML. Para las mismas rutas, detectar si el cliente pide JSON:
```javascript
exports.index = async (req, res, next) => {
  const [vehicles] = await db.query('SELECT * FROM vehicles');
  if (req.accepts('json')) {
    return res.json(vehicles);
  }
  res.render('fleet/index', { vehicles, ... });
};
```

O crear rutas separadas bajo `/api/v1/` que solo devuelvan JSON.

---

## 14. Errores comunes y cómo resolverlos

### `ReferenceError: next is not defined`

El handler async no declaró `next` como tercer parámetro:
```javascript
// ❌ Error
exports.index = async (req, res) => { ... next(err); }

// ✅ Correcto
exports.index = async (req, res, next) => { ... next(err); }
```

### `Error: ENOENT: no such file or directory, open 'public/uploads/...'`

El directorio `public/uploads/` no existe. Crear el directorio:
```bash
mkdir -p public/uploads
touch public/uploads/.gitkeep
```
O agregar lógica en `config/multer.js` para crearlo si no existe:
```javascript
const fs = require('fs');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
```

### `Error: ER_DUP_ENTRY` al crear un vehículo

La placa ya existe en la BD. El campo `plate` tiene una restricción `UNIQUE`. El controller actualmente no maneja este error de forma amigable. Para mejorarlo:
```javascript
} catch (err) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.render('fleet/form', {
      title: 'Nuevo Vehículo',
      vehicle: req.body,
      error: 'Ya existe un vehículo con esa placa.',
      PROGRAMS,
      schedule: null,
    });
  }
  next(err);
}
```

### `address already in use :::3306`

MySQL local ya está corriendo en el puerto 3306 y Docker intenta usarlo también. Solución: no exponer el puerto de la BD al host. En `docker-compose.yml`, el servicio `db` no debe tener sección `ports` (la app se conecta internamente por nombre de host `db`).

### La imagen del vehículo no aparece en el formulario de inspección

1. Verificar que el tipo del vehículo en BD coincide exactamente con las claves del `IMAGE_MAP` en `form.ejs` (por ejemplo, `'camión'` con tilde).
2. Verificar que el archivo existe en `public/images/` y en `/app/public/images/` dentro del contenedor.
3. Verificar que el select del vehículo tiene el atributo `data-type` poblado:
```ejs
<option value="<%= v.id %>" data-type="<%= v.type %>">
```

### El canvas del mapa de daños no responde al click

Verificar en la consola del navegador (F12 → Console) si hay errores. El canvas solo funciona si `canvasReady = true`, lo cual se activa en el evento `onload` de la imagen del vehículo. Si el vehículo no tiene tipo o el tipo no tiene imagen en `IMAGE_MAP`, el placeholder permanece visible y el canvas no se activa.

---

## 15. Convenciones de código del proyecto

### Nombres de archivos

- Controllers: `camelCase` + sufijo `Controller` → `fleetController.js`
- Routes: `camelCase` → `fleet.js`
- Vistas: `camelCase` o `kebab-case` → `form.ejs`, `index.ejs`
- CSS: clases en `kebab-case` con convención BEM → `.car-slide__hero--active`

### Async/await y manejo de errores

Todos los métodos async usan `try/catch` y pasan el error a `next(err)` para que el middleware de error global de `app.js` lo capture:
```javascript
exports.index = async (req, res, next) => {
  try {
    // lógica
  } catch (err) {
    next(err);  // → middleware de error en app.js
  }
};
```

### Queries SQL

- Siempre usar parámetros preparados (`?`), nunca concatenar variables.
- Desestructurar el resultado: `const [rows] = await db.query(...)` porque mysql2 devuelve `[rows, fields]`.
- Para INSERTs que necesitan el ID insertado: `const [result] = await db.query(...)` → `result.insertId`.

### Vistas EJS

- Incluir siempre `partials/head`, `partials/sidebar` (con `currentPage`) y `partials/topbar`.
- El `currentPage` activa la clase `sidebar__link--active` en el menú.
- Pasar siempre `title` al `render()` — se usa en `<title>` del head.

### CSS

- Todas las reglas nuevas van al final de `public/css/style.css`, agrupadas por componente con un comentario de sección:
```css
/* ── Nombre del componente ───────────────────────────────── */
```
- Usar variables CSS (`var(--navy)`, `var(--orange)`) en lugar de colores literales.
- No usar `!important` salvo casos de override muy justificados.
