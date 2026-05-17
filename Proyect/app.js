require('dotenv').config();
const express = require('express');
const path = require('path');

const dashboardRoutes = require('./routes/dashboard');
const fleetRoutes = require('./routes/fleet');
const inspectionRoutes = require('./routes/inspections');
const maintenanceRoutes = require('./routes/maintenance');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', dashboardRoutes);
app.use('/flota', fleetRoutes);
app.use('/inspecciones', inspectionRoutes);
app.use('/mantenimiento', maintenanceRoutes);

app.use((req, res) => {
  res.status(404).render('error', { title: '404', message: 'Página no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`FleetOps Command corriendo en http://localhost:${PORT}`);
});
