const db = require('../config/db');

const PROGRAMS = {
  1: ['Afinación','Afinación','Afinación','Medio Ajuste','Afinación','Afinación','Afinación','Ajuste'],
  2: ['Afinación','Afinación','Afinación','Afinación','Afinación','Afinación','Afinación','Afinación','Ajuste'],
  3: ['Afinación','Afinación','Afinación','Medio Ajuste','Afinación','Afinación','Afinación','Medio Ajuste'],
};

// Ensure every time-based schedule has a pending programmed maintenance record
async function syncProgrammedMaintenances() {
  const [schedules] = await db.query(`
    SELECT ms.*, v.plate
    FROM maintenance_schedules ms
    JOIN vehicles v ON ms.vehicle_id = v.id
    WHERE ms.trigger_type = 'time'
  `);

  for (const s of schedules) {
    const prog     = PROGRAMS[s.program_id] || [];
    const stepName = prog[s.current_step % prog.length];

    const [existing] = await db.query(
      `SELECT id FROM maintenance
       WHERE vehicle_id = ? AND is_programmed = 1 AND status != 'completado'`,
      [s.vehicle_id]
    );

    if (!existing.length) {
      const scheduledDate = new Date(s.updated_at);
      scheduledDate.setDate(scheduledDate.getDate() + s.trigger_value);

      await db.query(
        `INSERT INTO maintenance (vehicle_id, type, description, cost, status, scheduled_date, is_programmed)
         VALUES (?, 'preventivo', ?, 0, 'pendiente', ?, 1)`,
        [s.vehicle_id, `${stepName} — Programado`, scheduledDate.toISOString().split('T')[0]]
      );
    }
  }
}

exports.index = async (req, res, next) => {
  try {
    await syncProgrammedMaintenances();

    // Calendar month from query param or current month
    const now      = new Date();
    const monthStr = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [calYear, calMonthNum] = monthStr.split('-').map(Number);
    const calMonth = calMonthNum - 1; // 0-indexed for JS Date

    const monthStart = new Date(calYear, calMonth, 1);
    const monthEnd   = new Date(calYear, calMonth + 1, 1);

    // KPI queries in parallel
    const [[kpiRow], [vKpi]] = await Promise.all([
      db.query(`
        SELECT
          COALESCE(SUM(CASE WHEN MONTH(completed_date)=MONTH(CURDATE()) AND YEAR(completed_date)=YEAR(CURDATE()) THEN cost ELSE 0 END),0) AS monthly_cost,
          SUM(CASE WHEN scheduled_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(),INTERVAL 7 DAY) AND status!='completado' THEN 1 ELSE 0 END) AS upcoming_7
        FROM maintenance
      `),
      db.query(`
        SELECT
          SUM(status='mantenimiento') AS in_shop,
          COUNT(*) AS total,
          SUM(status='activo') AS active
        FROM vehicles
      `),
    ]);

    const kpi = {
      monthly_cost: Number(kpiRow[0].monthly_cost).toLocaleString('es-ES', { minimumFractionDigits: 2 }),
      upcoming_7:   kpiRow[0].upcoming_7   || 0,
      in_shop:      vKpi[0].in_shop        || 0,
      fleet_health: vKpi[0].total > 0 ? Math.round((vKpi[0].active / vKpi[0].total) * 100) : 100,
      active:       vKpi[0].active         || 0,
      total:        vKpi[0].total          || 0,
    };

    // Table records — programmed first (pending/in_progress), then manual by date
    const [records] = await db.query(
      `SELECT m.*, v.plate, v.brand, v.model
       FROM maintenance m JOIN vehicles v ON m.vehicle_id = v.id
       ORDER BY
         CASE m.status WHEN 'en_progreso' THEN 0 WHEN 'pendiente' THEN 1 ELSE 2 END,
         m.scheduled_date DESC`
    );

    // Calendar events for the displayed month
    const [calRows] = await db.query(
      `SELECT m.id, m.description, m.status, m.is_programmed, v.plate
       FROM maintenance m JOIN vehicles v ON m.vehicle_id = v.id
       WHERE m.scheduled_date >= ? AND m.scheduled_date < ?
       ORDER BY m.scheduled_date`,
      [monthStart, monthEnd]
    );

    const calendarEvents = {};
    calRows.forEach(m => {
      const d   = new Date(m.scheduled_date);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      if (!calendarEvents[key]) calendarEvents[key] = [];
      calendarEvents[key].push(m);
    });

    res.render('maintenance/index', {
      title: 'Mantenimiento',
      records, kpi,
      calYear, calMonth, calMonthNum, monthStr,
      calendarEvents,
      today: now,
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const [vehicles] = await db.query('SELECT id, plate, brand, model FROM vehicles ORDER BY plate');
    res.render('maintenance/form', { title: 'Nuevo Mantenimiento', record: null, vehicles, locked: false });
  } catch (err) {
    next(err);
  }
};

exports.store = async (req, res, next) => {
  try {
    const { vehicle_id, type, description, cost, status, scheduled_date, completed_date } = req.body;
    await db.query(
      'INSERT INTO maintenance (vehicle_id, type, description, cost, status, scheduled_date, completed_date, is_programmed) VALUES (?,?,?,?,?,?,?,0)',
      [vehicle_id, type, description, cost, status, scheduled_date || null, completed_date || null]
    );
    res.redirect('/mantenimiento');
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const [rows]     = await db.query('SELECT * FROM maintenance WHERE id = ?', [req.params.id]);
    const [vehicles] = await db.query('SELECT id, plate, brand, model FROM vehicles ORDER BY plate');
    if (!rows.length) return res.redirect('/mantenimiento');
    const record = rows[0];

    const today  = new Date(); today.setHours(0, 0, 0, 0);
    const locked = record.is_programmed === 1
      && record.scheduled_date
      && new Date(record.scheduled_date) > today;

    res.render('maintenance/form', { title: 'Editar Mantenimiento', record, vehicles, locked });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM maintenance WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.redirect('/mantenimiento');
    const record = rows[0];

    const today  = new Date(); today.setHours(0, 0, 0, 0);
    const locked = record.is_programmed === 1
      && record.scheduled_date
      && new Date(record.scheduled_date) > today;

    if (locked) return res.redirect(`/mantenimiento/${req.params.id}/editar`);

    const { vehicle_id, type, description, cost, status, scheduled_date, completed_date } = req.body;

    // Auto-advance schedule step when a programmed maintenance is completed
    if (record.is_programmed === 1 && status === 'completado' && record.status !== 'completado') {
      const [scheds] = await db.query('SELECT * FROM maintenance_schedules WHERE vehicle_id = ?', [record.vehicle_id]);
      if (scheds.length) {
        const s    = scheds[0];
        const prog = PROGRAMS[s.program_id] || [];
        await db.query('UPDATE maintenance_schedules SET current_step=? WHERE id=?',
          [(s.current_step + 1) % prog.length, s.id]);
      }
    }

    await db.query(
      'UPDATE maintenance SET vehicle_id=?,type=?,description=?,cost=?,status=?,scheduled_date=?,completed_date=? WHERE id=?',
      [vehicle_id, type, description, cost, status, scheduled_date || null, completed_date || null, req.params.id]
    );
    res.redirect('/mantenimiento');
  } catch (err) {
    next(err);
  }
};
