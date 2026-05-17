# FleetOps Command — Guía de Usuario

Esta guía explica cómo usar el sistema día a día. No se requiere ningún conocimiento técnico.

---

## ¿Qué es FleetOps Command?

FleetOps Command es un sistema que permite:

- Llevar el registro de todos los vehículos de la flota.
- Realizar inspecciones diarias de cada vehículo antes de que salga a ruta.
- Registrar y hacer seguimiento de los mantenimientos.
- Ver en el dashboard el estado general de la flota en tiempo real.

---

## Cómo acceder

Abra su navegador web (Chrome, Firefox, Edge) y escriba la dirección que le proporcionó su administrador. Normalmente es:

```
http://[dirección del servidor]:3000
```

No se necesita instalar nada en su computadora.

---

## Pantallas del sistema

### 1. Dashboard — Panel de Control (`/`)

Al entrar al sistema verá el panel operativo con información en tiempo real.

**Tarjetas de indicadores clave (KPI):**

| Tarjeta | Qué muestra |
|---|---|
| Vehículos Activos | Cuántos vehículos están disponibles para operar |
| En Mantenimiento | Cuántos vehículos están fuera de servicio por mantenimiento |
| Sin Inspección Hoy | Vehículos activos que aún no han sido inspeccionados hoy |
| Disponibilidad | Porcentaje de vehículos activos sobre el total registrado |

Cada tarjeta muestra una pequeña barra de progreso y una etiqueta de estado (verde/amarillo/rojo) para identificar de un vistazo si hay situaciones críticas.

**Gráfica de inspecciones (últimos 7 días):**

Muestra una barra por cada día de la última semana. Cada barra se divide en:
- **Azul marino** — inspecciones aprobadas (pass).
- **Naranja** — inspecciones fallidas (fail).

**Tabla de estado de flota:**

Lista los vehículos con su última inspección, la ruta que operó, el estado actual y la próxima fecha de servicio programada.

**Columna de alertas:**

Muestra tres tipos de alertas:
- **Seguros próximos a vencer** — vehículos cuyo seguro vence en los próximos 30 días, con los días restantes.
- **Inspecciones fallidas recientes** — las últimas inspecciones con resultado negativo.
- **Desviaciones de ruta** — sección reservada para cuando el sistema de rastreo GPS esté activo (en esta demo se muestra como placeholder).

**Mapa de flota (sección inferior):**

Muestra un mapa esquemático con las tres rutas disponibles y la posición aproximada de cada vehículo. Esta sección es de demostración: el mapa real requiere un sistema de rastreo GPS activo (ver campo Teléfono GPS en el registro de vehículos). Una leyenda debajo del mapa lo indica.

---

### 2. Gestión de Flota (`/flota`)

Aquí puede ver todos los vehículos registrados.

**Para buscar un vehículo:**
- Escriba la placa, marca o modelo en el campo de búsqueda.
- Use el selector de estado para filtrar por Activo, Inactivo o En Mantenimiento.
- Presione el botón **Filtrar**.

**Columnas de la tabla:**
- **Placa** — identificador único del vehículo.
- **Marca / Modelo** — ej. Volvo FH-460.
- **Año** — año de fabricación.
- **Tipo** — camión, furgoneta, automóvil o motocicleta.
- **Estado** — verde = activo, amarillo = en mantenimiento, gris = inactivo.
- **Seguro Vence** — fecha de vencimiento del seguro. Si está próxima a vencer, tener en cuenta para renovar.
- **Acciones** — botones para Ver Historial, Editar o Eliminar.

---

### 3. Registrar un nuevo vehículo

1. En la pantalla de Flota, presione el botón naranja **+ Nuevo Vehículo**.
2. Complete los datos del vehículo:
   - **Placa** — obligatorio, debe ser única.
   - **Marca** y **Modelo** — obligatorios.
   - **Año**, **Tipo**, **Estado** — seleccione de las listas.
   - **Capacidad de Combustible** — en litros (opcional).
   - **Vencimiento de Seguro** — fecha de expiración del seguro (opcional).
   - **Teléfono GPS** — número de teléfono asociado al dispositivo de rastreo instalado en el vehículo (opcional). Este número es el que el sistema usará en el futuro para localizar el vehículo en el mapa y detectar desviaciones de ruta.

3. **Programación de Mantenimiento Periódico** (opcional pero recomendado):
   - Seleccione si el mantenimiento se activa por **Distancia (km)** o **Tiempo (días)**.
   - Escriba el intervalo: cada cuántos km o días debe hacerse.
   - Elija la **secuencia de mantenimientos**:
     - **Programación 1** — Afinación × 3, Medio Ajuste, Afinación × 3, Ajuste (ciclo de 8 pasos).
     - **Programación 2** — Afinación × 8, Ajuste (ciclo de 9 pasos).
     - **Programación 3** — Afinación × 3, Medio Ajuste, Afinación × 3, Medio Ajuste (ciclo de 8 pasos).
   - Una vez asignada la programación por tiempo, el sistema generará automáticamente el próximo registro de mantenimiento en el calendario. Los registros generados automáticamente **no pueden modificarse** hasta que llegue o pase su fecha programada.

4. Presione **Crear Vehículo**.

---

### 4. Historial del vehículo (`/flota/:id/historial`)

Desde la tabla de flota, presione el botón **Historial** de cualquier vehículo para ver un resumen completo de toda su actividad.

**Qué muestra la página de historial:**

- **Encabezado** — imagen del tipo de vehículo, placa, marca/modelo, año, tipo y estado. Dos contadores con el total de inspecciones y mantenimientos registrados.

- **Inspecciones recientes** (columna izquierda):
  - Se muestran 3 inspecciones a la vez, ordenadas de la más reciente a la más antigua.
  - Cada tarjeta muestra: nombre del conductor, fecha, calificación por categoría con miniestrellas, resultado (Aprobada / Fallida), notas y miniaturas de fotos si las hay.
  - Botones **Anterior** y **Siguiente** para navegar entre páginas sin recargar más datos de los necesarios.

- **Mantenimientos recientes** (columna derecha):
  - Se muestran 3 registros a la vez, con tipo, descripción, costo, estado y fechas.
  - Botones de paginación independientes de los de inspecciones.

---

### 5. Formulario de Inspección Diaria (`/inspecciones/nueva`)

Este formulario debe completarse **antes de que el vehículo salga a ruta**.

**Datos generales (encabezado del formulario):**
- Seleccione el vehículo de la lista desplegable.
- Escriba el nombre completo del conductor.
- La fecha y hora se registran automáticamente.

**Selección de ruta:**

Antes de comenzar la inspección, seleccione la ruta que operará el vehículo hoy. Hay tres rutas disponibles:

| Ruta | Descripción |
|---|---|
| Ruta A | Terminal Norte → Destino A |
| Ruta B | Terminal Sur → Destino B |
| Ruta C | Terminal Este → Destino C |

> **Nota:** Estas son rutas de demostración. En producción, la integración con el sistema de rastreo GPS permitirá detectar si el vehículo se desvía de la ruta seleccionada.

**Pasos 1 al 4 — Categorías (carrusel):**

El formulario muestra una categoría a la vez. Hay 4 categorías:

1. **Motor y Mecánica** — nivel de aceite, refrigerante, correas.
2. **Sistema de Iluminación** — luces de cruce, intermitentes, frenos, matrícula.
3. **Ruedas y Neumáticos** — presión, desgaste, tuercas.
4. **Elementos de Seguridad** — frenos, extintor, chalecos, cinturones.

**Para cada categoría:**
- Marque con ✓ los ítems que estén en buen estado.
- Dé una **calificación de 1 a 5 estrellas** a esa categoría:
  - 5 — Excelente, todo en perfecto estado.
  - 4 — Bueno, sin problemas relevantes.
  - 3 — Regular, hay detalles a observar.
  - 2 — Malo, requiere atención pronto.
  - 1 — Crítico, el vehículo no debería salir a ruta.
- Al seleccionar las estrellas, el formulario avanza automáticamente a la siguiente categoría.

**Columna derecha — Información adicional:**

- **Mapa de Daños:**
  - Cuando seleccione el vehículo, aparecerá su imagen (camión, furgoneta, carro o moto).
  - Haga clic sobre la imagen en el lugar donde hay daños físicos visibles (abollones, rayones, roturas).
  - Aparecerá un círculo numerado en ese punto.
  - Puede hacer clic en varios puntos. Para limpiar, presione **Limpiar marcas**.

- **Observaciones y Notas:**
  - Escriba cualquier anomalía o comentario adicional.

- **Evidencia Fotográfica:**
  - Presione el área punteada para adjuntar fotos del vehículo (máx. 5 fotos).
  - Las fotos se guardan en el servidor.

- **Firma Digital del Conductor:**
  - El conductor debe firmar con el dedo o el mouse en el área de firma.
  - Para borrar y volver a firmar, presione **Limpiar firma**.

**Enviar la inspección:**
- Presione el botón naranja **FINALIZAR INSPECCIÓN** al final.
- El sistema calculará automáticamente si la inspección está **Aprobada** (todas las categorías con 4 o 5 estrellas) o **Fallida**.

---

### 6. Historial de Inspecciones (`/inspecciones`)

Muestra todas las inspecciones realizadas con su resultado. Puede ver el detalle de cada una presionando **Ver**, donde encontrará:
- Las calificaciones por categoría.
- Las marcas de daño sobre la imagen del vehículo.
- Las fotos adjuntas.
- La firma del conductor.

---

### 7. Registro de Mantenimiento (`/mantenimiento`)

**Indicadores de la flota:**

En la parte superior de la pantalla se muestran cuatro tarjetas con el estado global de mantenimiento:
- Total de registros en el sistema.
- Registros pendientes.
- Registros en progreso.
- Costo total acumulado.

**Calendario de mantenimientos:**

A la derecha de la pantalla aparece un calendario mensual. Los días con mantenimiento programado muestran puntos de color:
- **Punto naranja** — mantenimiento generado automáticamente por la programación periódica del vehículo.
- **Punto azul marino** — mantenimiento registrado manualmente.

Haga clic en cualquier día con punto para ver los detalles de los mantenimientos de esa fecha en el panel lateral.

**Mantenimientos generados automáticamente:**

Cuando un vehículo tiene una programación por tiempo (días) activa, el sistema genera automáticamente el próximo registro de mantenimiento. Estos registros aparecen en el calendario y en la lista, pero tienen un aviso de candado que indica que **no pueden editarse hasta que llegue la fecha programada**. Una vez llegada la fecha, puede editarlos normalmente y marcarlos como completados.

Al marcar un mantenimiento programado como **Completado**, el sistema avanza automáticamente la secuencia al siguiente paso.

**Para registrar un mantenimiento manual:**
1. Presione **+ Nuevo Registro**.
2. Seleccione el vehículo.
3. Indique el tipo: **Preventivo**, **Correctivo** o **Predictivo**.
4. Escriba la descripción del trabajo realizado.
5. Ingrese el costo y el estado actual (Pendiente, En Progreso, Completado).
6. Indique la fecha programada y, si ya se completó, la fecha de completado.

---

## Leyenda de colores de estado

| Color | Significado |
|---|---|
| Verde | Aprobado / Activo / Completado |
| Naranja | Alerta / Acción requerida / En progreso |
| Amarillo/Ámbar | Precaución — revisar |
| Rojo | Fallido / Crítico |
| Gris | Inactivo / Pendiente |

---

## Preguntas frecuentes

**¿Puedo editar una inspección ya enviada?**
No. Las inspecciones son registros permanentes para auditoría. Si hay un error, cree una nueva inspección.

**¿Qué pasa si el vehículo no pasa la inspección (resultado Fallido)?**
El sistema lo registra como Fallido y aparece en las alertas del dashboard. Es responsabilidad del supervisor decidir si el vehículo puede operar. Se recomienda crear un registro de mantenimiento correctivo.

**¿Por qué no puedo editar un mantenimiento programado?**
Los mantenimientos generados automáticamente están bloqueados hasta que llegue o pase su fecha programada, para mantener la integridad del calendario de mantenimiento. Una vez llegada la fecha, el bloqueo se libera.

**¿Las fotos se eliminan si borro un vehículo?**
Al eliminar un vehículo se eliminan sus inspecciones y programaciones de mantenimiento de la base de datos, pero los archivos de foto en el servidor no se borran automáticamente. Consulte a su administrador.

**¿El mapa del dashboard es funcional?**
El mapa muestra la distribución esquemática de la flota con fines de demostración. Para que sea funcional se requiere integrar un proveedor de rastreo GPS (los números de teléfono registrados en cada vehículo son el punto de conexión con ese sistema futuro).

**¿El sistema funciona en celular?**
El diseño es funcional en pantallas medianas y grandes. En celular puede visualizarse pero el formulario de inspección está optimizado para tablet o computadora.
