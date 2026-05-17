const db = require('../config/db');

exports.index = async (req, res, next) => {
  try {
    const [records] = await db.query(
      'SELECT m.*, v.plate, v.brand, v.model FROM maintenance m JOIN vehicles v ON m.vehicle_id = v.id ORDER BY m.scheduled_date DESC'
    );
    res.render('maintenance/index', { title: 'Registro de Mantenimiento', records });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const [vehicles] = await db.query('SELECT id, plate, brand, model FROM vehicles');
    res.render('maintenance/form', { title: 'Nuevo Mantenimiento', record: null, vehicles });
  } catch (err) {
    next(err);
  }
};

exports.store = async (req, res, next) => {
  try {
    const { vehicle_id, type, description, cost, status, scheduled_date, completed_date } = req.body;
    await db.query(
      'INSERT INTO maintenance (vehicle_id, type, description, cost, status, scheduled_date, completed_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [vehicle_id, type, description, cost, status, scheduled_date, completed_date || null]
    );
    res.redirect('/mantenimiento');
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM maintenance WHERE id = ?', [req.params.id]);
    const [vehicles] = await db.query('SELECT id, plate, brand, model FROM vehicles');
    if (!rows.length) return res.redirect('/mantenimiento');
    res.render('maintenance/form', { title: 'Editar Mantenimiento', record: rows[0], vehicles });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { vehicle_id, type, description, cost, status, scheduled_date, completed_date } = req.body;
    await db.query(
      'UPDATE maintenance SET vehicle_id=?, type=?, description=?, cost=?, status=?, scheduled_date=?, completed_date=? WHERE id=?',
      [vehicle_id, type, description, cost, status, scheduled_date, completed_date || null, req.params.id]
    );
    res.redirect('/mantenimiento');
  } catch (err) {
    next(err);
  }
};
