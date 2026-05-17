const db = require('../config/db');

const PROGRAMS = {
  1: ['Afinación','Afinación','Afinación','Medio Ajuste','Afinación','Afinación','Afinación','Ajuste'],
  2: ['Afinación','Afinación','Afinación','Afinación','Afinación','Afinación','Afinación','Afinación','Ajuste'],
  3: ['Afinación','Afinación','Afinación','Medio Ajuste','Afinación','Afinación','Afinación','Medio Ajuste'],
};

exports.index = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (plate LIKE ? OR brand LIKE ? OR model LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';

    const [vehicles] = await db.query(query, params);
    res.render('fleet/index', { title: 'Gestión de Flota', vehicles, search, status });
  } catch (err) {
    next(err);
  }
};

exports.advanceSchedule = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM maintenance_schedules WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.redirect('/flota#horarios');
    const s = rows[0];
    const prog = PROGRAMS[s.program_id] || [];
    const nextStep = (s.current_step + 1) % prog.length;
    await db.query('UPDATE maintenance_schedules SET current_step=? WHERE id=?', [nextStep, s.id]);
    res.redirect('/flota#horarios');
  } catch (err) {
    next(err);
  }
};

exports.create = (req, res) => {
  res.render('fleet/form', { title: 'Nuevo Vehículo', vehicle: null, schedule: null, PROGRAMS });
};

exports.store = async (req, res, next) => {
  try {
    const { plate, brand, model, year, type, status, fuel_capacity, insurance_expiry,
            phone, trigger_type, trigger_value, program_id } = req.body;

    const [result] = await db.query(
      'INSERT INTO vehicles (plate, brand, model, year, type, status, fuel_capacity, insurance_expiry, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [plate, brand, model, year, type, status, fuel_capacity, insurance_expiry, phone || null]
    );

    if (trigger_type && trigger_value && program_id) {
      await db.query(
        'INSERT INTO maintenance_schedules (vehicle_id, trigger_type, trigger_value, program_id) VALUES (?, ?, ?, ?)',
        [result.insertId, trigger_type, trigger_value, program_id]
      );
    }

    res.redirect('/flota');
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.redirect('/flota');
    const [schedRows] = await db.query(
      'SELECT * FROM maintenance_schedules WHERE vehicle_id = ?', [req.params.id]
    );
    res.render('fleet/form', {
      title: 'Editar Vehículo',
      vehicle: rows[0],
      schedule: schedRows[0] || null,
      PROGRAMS,
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { plate, brand, model, year, type, status, fuel_capacity, insurance_expiry,
            phone, trigger_type, trigger_value, program_id } = req.body;

    await db.query(
      'UPDATE vehicles SET plate=?, brand=?, model=?, year=?, type=?, status=?, fuel_capacity=?, insurance_expiry=?, phone=? WHERE id=?',
      [plate, brand, model, year, type, status, fuel_capacity, insurance_expiry, phone || null, req.params.id]
    );

    if (trigger_type && trigger_value && program_id) {
      await db.query(
        `INSERT INTO maintenance_schedules (vehicle_id, trigger_type, trigger_value, program_id)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE trigger_type=VALUES(trigger_type),
           trigger_value=VALUES(trigger_value), program_id=VALUES(program_id)`,
        [req.params.id, trigger_type, trigger_value, program_id]
      );
    }

    res.redirect('/flota');
  } catch (err) {
    next(err);
  }
};

exports.historial = async (req, res, next) => {
  try {
    const id    = req.params.id;
    const LIMIT = 3;
    const pageInsp  = Math.max(1, parseInt(req.query.pageInsp)  || 1);
    const pageMaint = Math.max(1, parseInt(req.query.pageMaint) || 1);

    const [vRows] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (!vRows.length) return res.redirect('/flota');
    const vehicle = vRows[0];

    const [[cInsp], [cMaint], [inspections], [maintenances]] = await Promise.all([
      db.query('SELECT COUNT(*) AS total FROM inspections  WHERE vehicle_id = ?', [id]),
      db.query('SELECT COUNT(*) AS total FROM maintenance  WHERE vehicle_id = ?', [id]),
      db.query(
        `SELECT id, driver_name, engine, lights, tires, safety, result,
                engine_rating, lights_rating, tires_rating, safety_rating,
                notes, photos, created_at
         FROM inspections WHERE vehicle_id = ?
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [id, LIMIT, (pageInsp - 1) * LIMIT]
      ),
      db.query(
        `SELECT * FROM maintenance WHERE vehicle_id = ?
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [id, LIMIT, (pageMaint - 1) * LIMIT]
      ),
    ]);

    res.render('fleet/historial', {
      title: `Historial — ${vehicle.plate}`,
      vehicle,
      inspections,
      maintenances,
      pageInsp,   pagesInsp:  Math.ceil(cInsp[0].total  / LIMIT), totalInsp:  cInsp[0].total,
      pageMaint,  pagesMaint: Math.ceil(cMaint[0].total / LIMIT), totalMaint: cMaint[0].total,
    });
  } catch (err) {
    next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    await db.query('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.redirect('/flota');
  } catch (err) {
    next(err);
  }
};
