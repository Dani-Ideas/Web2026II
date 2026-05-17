const db = require('../config/db');

exports.index = async (req, res, next) => {
  try {
    const [inspections] = await db.query(
      'SELECT i.*, v.plate, v.brand, v.model FROM inspections i JOIN vehicles v ON i.vehicle_id = v.id ORDER BY i.created_at DESC'
    );
    res.render('inspections/index', { title: 'Inspecciones', inspections });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const [vehicles] = await db.query("SELECT id, plate, brand, model FROM vehicles WHERE status = 'activo'");
    res.render('inspections/form', { title: 'Nueva Inspección', vehicles });
  } catch (err) {
    next(err);
  }
};

exports.store = async (req, res, next) => {
  try {
    const { vehicle_id, driver_name, engine, lights, tires, safety, notes, signature } = req.body;
    const photos = req.files ? req.files.map(f => f.filename).join(',') : '';

    const result = req.body.engine === 'pass' && req.body.lights === 'pass' &&
      req.body.tires === 'pass' && req.body.safety === 'pass' ? 'pass' : 'fail';

    await db.query(
      'INSERT INTO inspections (vehicle_id, driver_name, engine, lights, tires, safety, result, notes, photos, signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [vehicle_id, driver_name, engine, lights, tires, safety, result, notes, photos, signature]
    );
    res.redirect('/inspecciones');
  } catch (err) {
    next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT i.*, v.plate, v.brand, v.model FROM inspections i JOIN vehicles v ON i.vehicle_id = v.id WHERE i.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.redirect('/inspecciones');
    res.render('inspections/show', { title: 'Detalle de Inspección', inspection: rows[0] });
  } catch (err) {
    next(err);
  }
};
