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

### 1. Dashboard (Pantalla de inicio)

Al entrar al sistema verá tres tarjetas con información clave:

| Tarjeta | Qué muestra |
|---|---|
| Vehículos Totales | Cuántos vehículos están registrados |
| Activos | Cuántos están disponibles para operar |
| Mantenimientos Pendientes | Cuántos mantenimientos aún no se han completado |

Debajo aparece una tabla con las **últimas 5 inspecciones** realizadas, mostrando el vehículo, el conductor, si la inspección fue Aprobada o Fallida, y la fecha.

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
- **Acciones** — botones para Editar o Eliminar.

---

### 3. Registrar un nuevo vehículo

1. En la pantalla de Flota, presione el botón naranja **+ Nuevo Vehículo**.
2. Complete los datos del vehículo:
   - **Placa** — obligatorio, debe ser única.
   - **Marca** y **Modelo** — obligatorios.
   - **Año**, **Tipo**, **Estado** — seleccione de las listas.
   - **Capacidad de Combustible** — en litros (opcional).
   - **Vencimiento de Seguro** — fecha de expiración del seguro (opcional).

3. **Programación de Mantenimiento Periódico** (opcional pero recomendado):
   - Seleccione si el mantenimiento se activa por **Distancia (km)** o **Tiempo (días)**.
   - Escriba el intervalo: cada cuántos km o días debe hacerse.
   - Elija la **secuencia de mantenimientos**:
     - **Programación 1** — Afinación × 3, Medio Ajuste, Afinación × 3, Ajuste (ciclo de 8 pasos).
     - **Programación 2** — Afinación × 8, Ajuste (ciclo de 9 pasos).
     - **Programación 3** — Afinación × 3, Medio Ajuste, Afinación × 3, Medio Ajuste (ciclo de 8 pasos).
   - En cada secuencia, para que se active el siguiente mantenimiento, el anterior debe estar completado.

4. Presione **Crear Vehículo**.

---

### 4. Formulario de Inspección Diaria

Este formulario debe completarse **antes de que el vehículo salga a ruta**.

**Paso 0 — Datos generales:**
- Seleccione el vehículo de la lista desplegable.
- Escriba el nombre completo del conductor.
- La fecha y hora se registran automáticamente.

**Pasos 1 al 4 — Categorías (carrusel):**

El formulario muestra una categoría a la vez como una pantalla completa. Hay 4 categorías:

1. **Motor y Mecánica** — nivel de aceite, refrigerante, correas.
2. **Sistema de Iluminación** — luces de cruce, intermitentes, frenos, matrícula.
3. **Ruedas y Neumáticos** — presión, desgaste, tuercas.
4. **Elementos de Seguridad** — frenos, extintor, chalecos, cinturones.

**Para cada categoría:**
- Marque con ✓ los ítems que estén en buen estado.
- Dé una **calificación de 1 a 5 estrellas** a esa categoría:
  - ⭐⭐⭐⭐⭐ (5) — Excelente, todo en perfecto estado.
  - ⭐⭐⭐⭐ (4) — Bueno, sin problemas relevantes.
  - ⭐⭐⭐ (3) — Regular, hay detalles a observar.
  - ⭐⭐ (2) — Malo, requiere atención pronto.
  - ⭐ (1) — Crítico, el vehículo no debería salir a ruta.
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

### 5. Historial de Inspecciones (`/inspecciones`)

Muestra todas las inspecciones realizadas con su resultado. Puede ver el detalle de cada una presionando **Ver**, donde encontrará:
- Las calificaciones por categoría.
- Las marcas de daño sobre la imagen del vehículo.
- Las fotos adjuntas.
- La firma del conductor.

---

### 6. Registro de Mantenimiento (`/mantenimiento`)

**Para registrar un mantenimiento:**
1. Presione **+ Nuevo Registro**.
2. Seleccione el vehículo.
3. Indique el tipo: **Preventivo**, **Correctivo** o **Predictivo**.
4. Escriba la descripción del trabajo realizado.
5. Ingrese el costo y el estado actual (Pendiente, En Progreso, Completado).
6. Indique la fecha programada y, si ya se completó, la fecha de completado.

**Para marcar un mantenimiento de la secuencia como completado:**
- En la pantalla de edición del vehículo (`/flota/:id/editar`), en la sección de mantenimiento periódico, aparecerá el paso actual de la secuencia y un botón **Completar paso actual**. Al presionarlo, el sistema avanza al siguiente mantenimiento programado.

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
El sistema lo registra como Fallido. Es responsabilidad del supervisor decidir si el vehículo puede operar. Se recomienda crear un registro de mantenimiento correctivo.

**¿Las fotos se eliminan si borro un vehículo?**
Al eliminar un vehículo se eliminan sus inspecciones y programaciones de mantenimiento de la base de datos, pero los archivos de foto en el servidor no se borran automáticamente. Consulte a su administrador.

**¿El sistema funciona en celular?**
El diseño es funcional en pantallas medianas y grandes. En celular puede visualizarse pero el formulario de inspección está optimizado para tablet o computadora.
