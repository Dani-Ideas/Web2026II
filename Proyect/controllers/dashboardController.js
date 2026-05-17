const db = require('../config/db');

exports.index = async (req, res, next) => {
  try {
    const [vehicles] = await db.query('SELECT COUNT(*) AS total FROM vehicles');
    const [activeVehicles] = await db.query("SELECT COUNT(*) AS total FROM vehicles WHERE status = 'activo'");
    const [pendingMaintenance] = await db.query("SELECT COUNT(*) AS total FROM maintenance WHERE status = 'pendiente'");
    const [recentInspections] = await db.query(
      'SELECT i.*, v.plate, v.brand, v.model FROM inspections i JOIN vehicles v ON i.vehicle_id = v.id ORDER BY i.created_at DESC LIMIT 5'
    );

    res.render('dashboard/index', {
      title: 'Dashboard — FleetOps Command',
      stats: {
        total: vehicles[0].total,
        active: activeVehicles[0].total,
        pendingMaintenance: pendingMaintenance[0].total,
      },
      recentInspections,
    });
  } catch (err) {
    next(err);
  }
};
