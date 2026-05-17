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
    const [vehicles] = await db.query("SELECT id, plate, brand, model, type FROM vehicles WHERE status = 'activo'");
    res.render('inspections/form', { title: 'Nueva Inspección', vehicles });
  } catch (err) {
    next(err);
  }
};

function ratingToStatus(r) {
  const n = parseInt(r, 10);
  if (n >= 4) return 'pass';
  if (n === 3) return 'caution';
  return 'fail';
}

exports.store = async (req, res, next) => {
  try {
    const { vehicle_id, driver_name, route,
            engine_rating, lights_rating, tires_rating, safety_rating,
            notes, signature, damage_map } = req.body;

    const engine = ratingToStatus(engine_rating);
    const lights = ratingToStatus(lights_rating);
    const tires  = ratingToStatus(tires_rating);
    const safety = ratingToStatus(safety_rating);
    const result = [engine, lights, tires, safety].every(s => s === 'pass') ? 'pass' : 'fail';
    const photos = req.files ? req.files.map(f => f.filename).join(',') : '';

    await db.query(
      `INSERT INTO inspections
        (vehicle_id, driver_name, route, engine, lights, tires, safety, result,
         engine_rating, lights_rating, tires_rating, safety_rating,
         notes, photos, damage_map, signature)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [vehicle_id, driver_name, route || null, engine, lights, tires, safety, result,
       engine_rating || null, lights_rating || null, tires_rating || null, safety_rating || null,
       notes, photos, damage_map || null, signature]
    );
    res.redirect('/inspecciones');
  } catch (err) {
    next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT i.*, v.plate, v.brand, v.model, v.type FROM inspections i JOIN vehicles v ON i.vehicle_id = v.id WHERE i.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.redirect('/inspecciones');
    res.render('inspections/show', { title: 'Detalle de Inspección', inspection: rows[0] });
  } catch (err) {
    next(err);
  }
};
