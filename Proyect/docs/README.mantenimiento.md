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
7. [Cómo funciona el calendario de mantenimiento](#7-cómo-funciona-el-calendario-de-mantenimiento)
8. [Cómo funciona el historial de vehículo (paginación paralela)](#8-cómo-funciona-el-historial-de-vehículo-paginación-paralela)
9. [Cómo funciona el dashboard](#9-cómo-funciona-el-dashboard)
10. [Cómo agregar más rutas al selector de ruta](#10-cómo-agregar-más-rutas-al-selector-de-ruta)
11. [Cómo funciona la subida de fotos](#11-cómo-funciona-la-subida-de-fotos)
12. [Cómo funciona el mapa de daños y la firma digital](#12-cómo-funciona-el-mapa-de-daños-y-la-firma-digital)
13. [Cómo modificar el sistema de diseño (colores, tipografía)](#13-cómo-modificar-el-sistema-de-diseño-colores-tipografía)
14. [Cómo agregar un nuevo tipo de vehículo con su imagen](#14-cómo-agregar-un-nuevo-tipo-de-vehículo-con-su-imagen)
15. [Migraciones de base de datos](#15-migraciones-de-base-de-datos)
16. [Docker — producción y operación](#16-docker--producción-y-operación)
17. [Escalabilidad — qué cambiar cuando crezca](#17-escalabilidad--qué-cambiar-cuando-crezca)
18. [Errores comunes y cómo resolverlos](#18-errores-comunes-y-cómo-resolverlos)
19. [Convenciones de código del proyecto](#19-convenciones-de-código-del-proyecto)

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
│   ├── fleet.js            ← Rutas de /flota (incluye /:id/historial)
│   ├── inspections.js      ← Rutas de /inspecciones
│   └── maintenance.js      ← Rutas de /mantenimiento
│
├── controllers/
│   ├── dashboardController.js   ← Dashboard con 6 queries paralelas y KPIs
│   ├── fleetController.js       ← CRUD vehículos + historial + avance de secuencia
│   ├── inspectionController.js  ← CRUD inspecciones con ruta y tipo de vehículo
│   └── maintenanceController.js ← CRUD mantenimiento + sync automático + bloqueo
│
├── views/                  ← Plantillas EJS (HTML con código JS embebido)
│   ├── partials/           ← Fragmentos reutilizables
│   │   ├── head.ejs        ← <head> con CSS y fuentes
│   │   ├── sidebar.ejs     ← Menú lateral
│   │   └── topbar.ejs      ← Barra superior con título
│   ├── dashboard/index.ejs ← Dashboard con KPIs, gráfica, alertas y mapa SVG
│   ├── fleet/
│   │   ├── index.ejs       ← Lista de vehículos con botón Historial
│   │   ├── form.ejs        ← Crear / editar vehículo (incluye campo phone)
│   │   └── historial.ejs   ← Historial paginado de inspecciones y mantenimientos
│   ├── inspections/
│   │   ├── form.ejs        ← Formulario carrusel (incluye selector de ruta)
│   │   ├── index.ejs       ← Historial global de inspecciones
│   │   └── show.ejs        ← Detalle con overlay de daños sobre imagen del vehículo
│   ├── maintenance/
│   │   ├── index.ejs       ← Lista + KPIs + calendario con eventos
│   │   └── form.ejs        ← Crear / editar (con aviso de bloqueo si es programado)
│   └── error.ejs           ← Página de error genérica
│
├── public/                 ← Archivos estáticos servidos directamente al browser
│   ├── css/style.css       ← TODA la hoja de estilos del proyecto
│   ├── js/signature.js     ← (legado, la lógica actual está inline en form.ejs)
│   ├── images/             ← Imágenes de tipos de vehículo (PNG transparente)
│   └── uploads/            ← Fotos subidas por usuarios
│
├── database/
│   └── schema.sql          ← Definición completa de tablas
│
└── docs/
    ├── README.usuario.md       ← Guía para el usuario final
    ├── README.tecnico.md       ← Referencia para DevOps/sysadmin
    └── README.mantenimiento.md ← Este archivo
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

`config/db.js` crea un **pool** de conexiones. Los controllers hacen:

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
```bash
docker exec -i proyect-db-1 mysql -ufleetops -psecret fleetops_db -e \
  "ALTER TABLE vehicles ADD COLUMN odometer INT DEFAULT NULL;"
```

**Paso 2 — Actualizar `database/schema.sql`** para que las instalaciones futuras incluyan la columna.

**Paso 3 — Usar la columna en el controller** (`fleetController.js`):
```javascript
const { plate, brand, ..., odometer } = req.body;
await db.query(
  'INSERT INTO vehicles (plate, brand, ..., odometer) VALUES (?, ?, ..., ?)',
  [plate, brand, ..., odometer || null]
);
```

**Paso 4 — Mostrar en la vista EJS** (`views/fleet/form.ejs`):
```ejs
<div class="form__group">
  <label class="form__label">Kilometraje actual</label>
  <input type="number" name="odometer" class="input"
    value="<%= vehicle ? vehicle.odometer : '' %>" />
</div>
```

> **Nota:** MySQL 8.0 no soporta `IF NOT EXISTS` en `ALTER TABLE ADD COLUMN`. Si el script puede correr dos veces, verificar primero con `SHOW COLUMNS FROM vehicles LIKE 'odometer'`.

---

## 4. Cómo agregar una nueva página o módulo

Supongamos que queremos agregar un módulo de **Conductores** (`/conductores`).

### Paso 1 — Crear la tabla en la BD

```sql
CREATE TABLE IF NOT EXISTS drivers (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  license    VARCHAR(40),
  phone      VARCHAR(20),
  status     ENUM('activo','inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Paso 2 — Crear el archivo de rutas (`routes/drivers.js`)

```javascript
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/driverController');

router.get('/',              ctrl.index);
router.get('/nuevo',         ctrl.create);
router.post('/',             ctrl.store);
router.get('/:id/editar',    ctrl.edit);
router.post('/:id',          ctrl.update);
router.post('/:id/eliminar', ctrl.destroy);

module.exports = router;
```

### Paso 3 — Crear el controller (`controllers/driverController.js`)

```javascript
const db = require('../config/db');

exports.index = async (req, res, next) => {
  try {
    const [drivers] = await db.query('SELECT * FROM drivers ORDER BY name');
    res.render('drivers/index', { title: 'Conductores', drivers });
  } catch (err) { next(err); }
};
// edit, update, destroy siguen el mismo patrón que fleetController
```

### Paso 4 — Registrar la ruta en app.js

```javascript
const driverRoutes = require('./routes/drivers');
app.use('/conductores', driverRoutes);
```

### Paso 5 — Crear las vistas y agregar al menú lateral

Crear `views/drivers/index.ejs` y `form.ejs`. En `views/partials/sidebar.ejs`:
```ejs
<a href="/conductores" class="sidebar__link
  <%= currentPage === 'drivers' ? 'sidebar__link--active' : '' %>">
  Conductores
</a>
```

---

## 5. Cómo modificar el formulario de inspección

El formulario está en `views/inspections/form.ejs`. Es el archivo más complejo del proyecto.

### Estructura del carrusel

```
car-wrap (overflow: hidden)
  └── car-track (display: flex; width: 400%)
        ├── car-slide 1  Motor        (min-width: 100%)
        ├── car-slide 2  Iluminación  (min-width: 100%)
        ├── car-slide 3  Neumáticos   (min-width: 100%)
        └── car-slide 4  Seguridad    (min-width: 100%)

Al ir al slide 2: car-track.style.transform = 'translateX(-100%)'
```

### Agregar una nueva categoría al carrusel

1. Copiar un bloque `<div class="car-slide">` y modificar gradiente, ícono, título, ítems del checklist, ID de estrellas (`name="new_rating"`) y botón siguiente.
2. Agregar un dot: `<button type="button" class="car-dot" onclick="goToSlide(4)"></button>`
3. Actualizar `TOTAL = 5` en el bloque `<script>`.
4. Agregar columna en BD: `ALTER TABLE inspections ADD COLUMN new_rating TINYINT DEFAULT NULL;`
5. Actualizar `store` en `inspectionController.js` para recibir y guardar `new_rating`.

### Selector de ruta

El selector de ruta está implementado como un grupo de radio buttons estilizados (`class="db-route-opt"`). Las rutas están hardcodeadas en `form.ejs` como un array inline:

```javascript
[
  { val:'A', name:'Ruta A', desc:'Terminal Norte → Destino A', color:'var(--orange)' },
  { val:'B', name:'Ruta B', desc:'Terminal Sur → Destino B',   color:'#8192a7' },
  { val:'C', name:'Ruta C', desc:'Terminal Este → Destino C',  color:'var(--pass-text)' },
]
```

El valor seleccionado se envía como `route` en el POST y se guarda en `inspections.route`. Ver sección 10 para agregar más rutas.

---

## 6. Cómo funciona la programación de mantenimiento periódico

### Las tres secuencias predefinidas

La constante `PROGRAMS` está **duplicada** en dos archivos:
- `controllers/fleetController.js` — para mostrar las tarjetas en el form de vehículo.
- `controllers/maintenanceController.js` — para el sync automático y el avance de secuencia.

Si se agrega una nueva secuencia, hay que actualizarla en **ambos** archivos.

```javascript
const PROGRAMS = {
  1: ['Afinación','Afinación','Afinación','Medio Ajuste','Afinación','Afinación','Afinación','Ajuste'],
  2: ['Afinación','Afinación','Afinación','Afinación','Afinación','Afinación','Afinación','Afinación','Ajuste'],
  3: ['Afinación','Afinación','Afinación','Medio Ajuste','Afinación','Afinación','Afinación','Medio Ajuste'],
};
```

### Ciclo de vida automático (trigger_type = 'time')

```
1. Vehículo asignado a Programación 1, trigger_value = 30 días
   current_step = 0 → próximo = 'Afinación'

2. GET /mantenimiento dispara syncProgrammedMaintenances()
   → No hay registro pendiente para este vehículo
   → INSERT maintenance (scheduled_date = updated_at + 30 días, is_programmed = 1)

3. El registro aparece en el calendario y en la lista
   → Bloqueado hasta que llegue scheduled_date

4. Operador marca el registro como 'completado'
   → UPDATE maintenance SET status = 'completado'
   → UPDATE maintenance_schedules SET current_step = 1
   → La próxima carga de /mantenimiento genera el siguiente registro (paso 2 otra vez)
```

### Agregar una nueva secuencia (Programación 4)

1. En **ambos** controllers, agregar al objeto `PROGRAMS`:
```javascript
4: ['Afinación','Afinación','Medio Ajuste','Afinación','Afinación','Ajuste'],
```

2. En `views/fleet/form.ejs`, el carrusel se genera con `Object.entries(PROGRAMS)` — aparece automáticamente.

3. `program_id` es `TINYINT` en BD → soporta hasta 127 sin cambio de schema.

### syncProgrammedMaintenances() — detalles de implementación

La función es **idempotente**: antes de insertar, verifica si ya existe un registro con `is_programmed = 1` y `status != 'completado'` para ese vehículo. Si existe, no hace nada. Esto la hace segura para llamar en cada carga de página.

Limitación actual: solo procesa `trigger_type = 'time'`. Para vehículos con criterio por distancia (km), el avance sigue siendo manual via `POST /flota/horario/:id/avanzar`.

---

## 7. Cómo funciona el calendario de mantenimiento

### Construcción server-side

El controller calcula la cuadrícula del mes en curso (o del mes pasado por `?month=YYYY-MM`):

```javascript
// Construye array de celdas para el grid de 7 columnas
const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Dom
const cells = [];
for (let i = 0; i < firstDow; i++) cells.push({ day: null, key: null });
for (let d = 1; d <= daysInMonth; d++) {
  cells.push({
    day: d,
    key: `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  });
}
```

El diccionario de eventos se construye desde los registros de mantenimiento con `scheduled_date` en el mes:

```javascript
const calendarEvents = {};
calRows.forEach(m => {
  const d = new Date(m.scheduled_date);
  const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
  if (!calendarEvents[key]) calendarEvents[key] = [];
  calendarEvents[key].push(m);
});
```

> **Por qué UTC:** Las fechas `DATE` de MySQL se deserializan como medianoche UTC. Usar `getUTCFullYear/Month/Date` evita que la zona horaria del servidor desplace el día.

### Navegación entre meses

Los botones de navegación apuntan a `?month=YYYY-MM`:
```ejs
<a href="?month=<%= prevMonth %>">‹</a>
<a href="?month=<%= nextMonth %>">›</a>
```

### Eventos en el cliente sin recargar

El controller serializa todos los eventos como JSON dentro del EJS:
```ejs
<script>
  const CAL_EVENTS = <%- JSON.stringify(calendarEvents) %>;
</script>
```

El click en un día llama a `showDayEvents(key)` que lee `CAL_EVENTS[key]` y renderiza el panel de eventos en el lado derecho sin hacer una nueva petición al servidor.

### Indicadores de tipo en el calendario

- **Punto naranja** (`maint-cal__dot--prog`): `is_programmed = 1`
- **Punto azul marino** (`maint-cal__dot--manual`): `is_programmed = 0`

---

## 8. Cómo funciona el historial de vehículo (paginación paralela)

La ruta `GET /flota/:id/historial` (`fleetController.historial`) usa `Promise.all` para hacer cuatro queries simultáneas:

```javascript
const [[cInsp], [cMaint], [inspections], [maintenances]] = await Promise.all([
  db.query('SELECT COUNT(*) AS total FROM inspections  WHERE vehicle_id = ?', [id]),
  db.query('SELECT COUNT(*) AS total FROM maintenance  WHERE vehicle_id = ?', [id]),
  db.query(`SELECT id, driver_name, engine, lights, tires, safety, result,
            engine_rating, lights_rating, tires_rating, safety_rating,
            notes, photos, created_at
            FROM inspections WHERE vehicle_id = ?
            ORDER BY created_at DESC LIMIT ? OFFSET ?`,
           [id, LIMIT, (pageInsp - 1) * LIMIT]),
  db.query(`SELECT * FROM maintenance WHERE vehicle_id = ?
            ORDER BY created_at DESC LIMIT ? OFFSET ?`,
           [id, LIMIT, (pageMaint - 1) * LIMIT]),
]);
```

**Por qué excluir `damage_map` y `signature`:** Cada campo base64 ocupa 50–80 KB. En una página que muestra 3 inspecciones, eso sería hasta 480 KB de datos que no se usan. La vista de detalle individual (`/inspecciones/:id`) carga estos campos.

**Paginación independiente:** `pageInsp` y `pageMaint` son parámetros de query separados. Los botones de paginación construyen URLs preservando el otro parámetro:

```javascript
function pagerUrl(paramName, newPage) {
  const u = new URL(window.location.href);
  u.searchParams.set(paramName, newPage);
  return u.toString();
}
```

En EJS esto se implementa con una función helper que construye la URL preservando ambos parámetros de página.

---

## 9. Cómo funciona el dashboard

El `dashboardController.index` ejecuta 6 queries en paralelo. Los KPIs se calculan en el controller antes de pasar a la vista:

```javascript
const availability = vStats.total > 0
  ? Math.round((vStats.active / vStats.total) * 100) : 0;
```

La gráfica de 7 días rellena los días sin datos:
```javascript
const chartData = last7Days.map(d => chartMap[d] || { pass_count: 0, fail_count: 0 });
```

El mapa SVG en `dashboard/index.ejs` usa coordenadas hardcodeadas (`viewBox="0 0 900 360"`):
- Ruta A: línea horizontal naranja (`y=120`).
- Ruta B: línea diagonal gris.
- Ruta C: línea vertical verde.
- Marcadores de vehículos: círculos generados desde `fleetList.slice(0,6)` con 6 posiciones fijas.

El SVG es solo una representación esquemática de demostración.

---

## 10. Cómo agregar más rutas al selector de ruta

Las rutas están hardcodeadas en `views/inspections/form.ejs`. Para producción real con rutas dinámicas:

### Opción A — Ampliar el array inline (simple, para pocas rutas fijas)

En `views/inspections/form.ejs`, agregar al array de rutas:
```javascript
{ val:'D', name:'Ruta D', desc:'Terminal Oeste → Destino D', color:'#7c3aed' },
```

También actualizar la validación del campo `route` en la BD si se cambió de `VARCHAR(2)` a `VARCHAR(1)`. Con valores de una letra (A–Z) alcanza 26 rutas.

### Opción B — Tabla de rutas en BD (para rutas configurables desde la UI)

1. Crear tabla `routes`:
```sql
CREATE TABLE routes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(10) NOT NULL UNIQUE,
  name        VARCHAR(80) NOT NULL,
  description VARCHAR(200),
  color       VARCHAR(20) DEFAULT '#8192a7'
);
```

2. En `inspectionController.create`, cargar las rutas:
```javascript
const [routes] = await db.query('SELECT * FROM routes ORDER BY code');
res.render('inspections/form', { title: 'Nueva Inspección', vehicles, routes });
```

3. En `form.ejs`, reemplazar el array hardcodeado por `<% routes.forEach(r => { %>`.

4. Cambiar la columna `inspections.route` a `VARCHAR(10)` (o FK a `routes.id`).

---

## 11. Cómo funciona la subida de fotos

```
form.ejs: <input type="file" name="evidencia" multiple />
    ↓ multipart/form-data POST /inspecciones
routes/inspections.js: upload.array('evidencia', 5)
    ↓ Multer intercepta los archivos
config/multer.js:
  - Valida tipo: jpeg/jpg/png/webp (extensión Y mimetype)
  - Valida tamaño: máx 5 MB
  - Genera nombre: {Date.now()}-{random}.{ext}
  - Guarda en: public/uploads/
    ↓
inspectionController.js:
  const photos = req.files ? req.files.map(f => f.filename).join(',') : '';
    ↓
MySQL: photos = '1716000000000-123.jpg,1716000000001-456.png'
    ↓
show.ejs:
  <% inspection.photos.split(',').forEach(photo => { %>
    <img src="/uploads/<%= photo %>" />
  <% }) %>
```

### Cambiar el límite de fotos o el tamaño máximo

En `config/multer.js`: `limits: { fileSize: 10 * 1024 * 1024 }` → 10 MB.
En `routes/inspections.js`: `upload.array('evidencia', 10)` → hasta 10 archivos.

---

## 12. Cómo funciona el mapa de daños y la firma digital

### Mapa de daños

El canvas es transparente y se posiciona encima de la imagen del vehículo con `position: absolute`. Solo contiene los círculos de daño. La imagen del vehículo se puede reconstruir desde el `type` del vehículo guardado en la inspección.

El evento `onload` de la imagen se asigna **antes** de `src` para garantizar que dispare aunque la imagen esté en caché:
```javascript
vImg.onload = function() { canvasReady = true; ... };
vImg.src = IMAGE_MAP[vehicleType];
if (vImg.complete && vImg.naturalWidth > 0) { canvasReady = true; ... }
```

En `show.ejs`, el canvas guardado se muestra como un segundo `<img>` sobre la imagen del vehículo:
```ejs
<img class="dmg-img"     src="<%= vImgSrc %>"              alt="vehículo" />
<img class="dmg-overlay" src="<%= inspection.damage_map %>" alt="marcas" />
```

Ambos tienen `position: absolute; inset: 0` dentro de un contenedor relativo. Las marcas se alinean porque el canvas se capturó con las mismas dimensiones del contenedor.

### Firma digital

Mismo principio: canvas con líneas continuas siguiendo el movimiento del mouse/dedo, guardado como base64 en `inspections.signature` y mostrado en `show.ejs` como `<img src="<%= inspection.signature %>">`.

---

## 13. Cómo modificar el sistema de diseño (colores, tipografía)

Todos los estilos están en `public/css/style.css`. Al inicio está el bloque `:root`:

```css
:root {
  --navy:       #1a2b3c;
  --navy-dark:  #041627;
  --orange:     #fd8b00;
  --surface:    #f8f9ff;
  --white:      #ffffff;
  ...
}
```

Cambiar `--orange` propaga el cambio a todos los botones de acción, barras de progreso, dots del carrusel, etc.

Las reglas nuevas van al final de `style.css`, agrupadas con comentario de sección:
```css
/* ── Nombre del componente ───────────────────────────────── */
```

Seguir convención BEM: `.bloque`, `.bloque__elemento`, `.bloque--modificador`.

---

## 14. Cómo agregar un nuevo tipo de vehículo con su imagen

1. **Preparar la imagen** — PNG con fondo transparente, vista lateral, 400–700 px de ancho. Guardar en `public/images/MiVehiculo.png`.

2. **Copiar al contenedor Docker:**
```bash
docker cp public/images/MiVehiculo.png proyect-app-1:/app/public/images/
```

3. **Agregar la opción en el form de flota** (`views/fleet/form.ejs`):
```html
<option value="remolque" <%= vehicle && vehicle.type === 'remolque' ? 'selected' : '' %>>Remolque</option>
```

4. **Conectar con el mapa de daños** (`views/inspections/form.ejs`):
```javascript
const IMAGE_MAP = {
  'camión':      '/images/Trailer.png',
  'furgoneta':   '/images/camioneta.png',
  'automóvil':   '/images/Carro.png',
  'motocicleta': '/images/Moto.png',
  'remolque':    '/images/MiVehiculo.png',  // ← agregar aquí
};
```

5. **Agregar la misma entrada** en `views/fleet/historial.ejs` y `views/inspections/show.ejs` donde se mapea el tipo a la imagen.

---

## 15. Migraciones de base de datos

Este proyecto no usa un framework de migraciones. Las migraciones se hacen manualmente.

### Procedimiento estándar

1. Escribir el SQL de migración.
2. Aplicarlo en la BD corriendo.
3. Actualizar `database/schema.sql`.
4. Actualizar controllers y vistas.

### Ejemplo con Docker

```bash
docker exec -i proyect-db-1 mysql -ufleetops -psecret fleetops_db <<'SQL'
ALTER TABLE vehicles ADD COLUMN odometer INT DEFAULT NULL;
SQL
```

> MySQL 8.0 no soporta `IF NOT EXISTS` en `ALTER TABLE ADD COLUMN`. Si el script puede correr dos veces, verificar primero con una `SELECT` sobre `information_schema`.

### Recrear la BD desde cero (solo desarrollo)

```bash
docker compose down -v   # borra el volumen de datos
docker compose up -d     # recrea con schema.sql limpio
```

---

## 16. Docker — producción y operación

### Cuándo se necesita `--build`

| Cambio | Acción necesaria |
|---|---|
| `package.json` (nueva dependencia) | `docker compose up --build` |
| `Dockerfile` | `docker compose up --build` |
| `app.js` | `docker compose restart app` |
| `views/**/*.ejs` | Ninguna — volumen montado, recarga instantánea |
| `public/css/style.css` | Ninguna — volumen montado |
| `public/js/**` | Ninguna — volumen montado |
| `controllers/**` | `docker compose restart app` (nodemon no corre en prod) |
| `routes/**` | `docker compose restart app` |

### Ver logs en tiempo real

```bash
docker compose logs -f app    # Solo Node.js
docker compose logs -f db     # Solo MySQL
docker compose logs -f        # Ambos
```

### Backup y restauración

```bash
# Backup
docker exec proyect-db-1 \
  mysqldump -ufleetops -psecret fleetops_db \
  > backup-$(date +%Y%m%d).sql

# Restauración
docker exec -i proyect-db-1 \
  mysql -ufleetops -psecret fleetops_db \
  < backup-20260517.sql
```

### Cambiar el puerto público

En `docker-compose.yml`: `ports: - "8080:3000"` → accesible en `:8080`.

---

## 17. Escalabilidad — qué cambiar cuando crezca

### Si aumentan los usuarios simultáneos

Aumentar el pool en `config/db.js`: `connectionLimit: 25`.

Para múltiples instancias: agregar Nginx como reverse proxy con `deploy: replicas: 3` en `docker-compose.yml`.

### Si el base64 de firmas y daños crece mucho

Un canvas de 380×130 px ocupa ~50–80 KB como base64. Para 10.000 inspecciones = 500–800 MB solo en firmas.

Solución: convertir el base64 a archivo PNG en el servidor al recibir el POST, guardar el nombre del archivo en BD, y servir estáticamente. Los campos `MEDIUMTEXT` soportan hasta 16 MB por fila, pero las queries de listado ya los excluyen (`SELECT id, driver_name, ...` sin `damage_map` ni `signature`).

### Si se necesita autenticación

1. `npm install express-session bcryptjs connect-mysql2`
2. Crear tabla `users` (id, email, password_hash, role).
3. Crear `routes/auth.js` con GET/POST `/login` y GET `/logout`.
4. Agregar middleware de autenticación en `app.js` antes de las rutas protegidas.

### Si se necesita rastreo GPS real

El campo `phone` en `vehicles` es el punto de conexión: contiene el número del dispositivo GPS instalado. Para activar el mapa real:
1. Integrar con una API de rastreo (Traccar, Google Maps Platform, etc.).
2. Reemplazar el SVG estático en `dashboard/index.ejs` con el mapa interactivo.
3. El selector de rutas en `inspections/form.ejs` pasaría de ser demo a funcional comparando la posición GPS contra el polígono de cada ruta.

---

## 18. Errores comunes y cómo resolverlos

### La vista muestra el diseño antiguo aunque se editó el archivo

Con Docker, si el directorio no está montado como volumen, el contenedor usa la versión del archivo que tenía cuando se construyó la imagen. Verificar que `docker-compose.yml` tenga los mounts de `./views`, `./public/css`, `./public/js`, `./controllers` y `./routes`. Si falta alguno, agregar y correr `docker compose up --build` una vez.

### `ReferenceError: next is not defined`

```javascript
// ❌
exports.index = async (req, res) => { ... next(err); }
// ✅
exports.index = async (req, res, next) => { ... next(err); }
```

### `Error: ER_DUP_ENTRY` al crear un vehículo

La placa ya existe (campo `UNIQUE`). Para manejo amigable:
```javascript
} catch (err) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.render('fleet/form', {
      title: 'Nuevo Vehículo', vehicle: req.body,
      error: 'Ya existe un vehículo con esa placa.', PROGRAMS, schedule: null,
    });
  }
  next(err);
}
```

### La imagen del vehículo no aparece en el formulario de inspección

1. Verificar que el tipo del vehículo en BD coincida exactamente con las claves del `IMAGE_MAP` en `form.ejs` (ej. `'camión'` con tilde).
2. Verificar que el archivo existe en `public/images/` y dentro del contenedor Docker.
3. Verificar que el `<option>` del vehículo tenga `data-type` poblado.

### El canvas del mapa de daños no responde al click

El canvas solo se activa si `canvasReady = true`, lo que ocurre en el `onload` de la imagen del vehículo. Si el vehículo no tiene tipo o el tipo no está en `IMAGE_MAP`, el placeholder permanece y el canvas no se activa.

### `address already in use :::3306`

MySQL local ya corre en el puerto 3306. El servicio `db` no debe exponer `ports` al host — la app se conecta internamente por el hostname `db`.

### Error al hacer `ALTER TABLE`: `Duplicate column name`

MySQL no soporta `IF NOT EXISTS` en `ALTER TABLE ADD COLUMN`. La migración falló a medias o ya se aplicó. Verificar con:
```sql
SHOW COLUMNS FROM vehicles LIKE 'phone';
```
Si ya existe, no reaplicar.

---

## 19. Convenciones de código del proyecto

### Nombres de archivos

- Controllers: `camelCase` + sufijo `Controller` → `fleetController.js`
- Routes: `camelCase` → `fleet.js`
- Vistas: `camelCase` o `kebab-case` → `form.ejs`, `historial.ejs`
- CSS: clases en `kebab-case` con convención BEM → `.maint-cal__day--today`

### Async/await y manejo de errores

```javascript
exports.index = async (req, res, next) => {
  try {
    // lógica
  } catch (err) {
    next(err);  // → middleware de error global en app.js
  }
};
```

### Queries SQL

- Siempre parámetros preparados (`?`), nunca concatenación.
- Desestructurar: `const [rows] = await db.query(...)`.
- Para INSERTs con ID: `const [result] = await db.query(...)` → `result.insertId`.
- Para queries paralelas independientes: `const [[a], [b], [c]] = await Promise.all([...])`.

### Vistas EJS

- Incluir siempre `partials/head`, `partials/sidebar` (con `currentPage`) y `partials/topbar`.
- Pasar siempre `title` al `render()`.
- No cargar `damage_map` ni `signature` en queries de listado — solo en `show`.

### CSS

- Reglas nuevas al final de `public/css/style.css`, agrupadas con comentario de sección.
- Usar `var(--navy)`, `var(--orange)` en lugar de colores literales.
- No usar `!important` salvo override muy justificado.
