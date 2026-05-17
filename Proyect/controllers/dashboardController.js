const db = require('../config/db');

exports.index = async (req, res, next) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [[vStats], [pendingInsp], [chartRows], [expiringIns], [failedInsp], [fleetList]] =
      await Promise.all([
        db.query(`SELECT SUM(status='activo') AS active, SUM(status='mantenimiento') AS in_maint, COUNT(*) AS total FROM vehicles`),
        db.query(`SELECT COUNT(*) AS cnt FROM vehicles v WHERE v.status='activo'
          AND NOT EXISTS (SELECT 1 FROM inspections WHERE vehicle_id=v.id AND DATE(created_at)=CURDATE())`),
        db.query(`SELECT DATE(created_at) AS day, SUM(result='pass') AS pass_count, SUM(result='fail') AS fail_count
          FROM inspections WHERE created_at >= ? GROUP BY DATE(created_at) ORDER BY day`, [sevenDaysAgo]),
        db.query(`SELECT plate, brand, model, DATEDIFF(insurance_expiry, CURDATE()) AS days_left
          FROM vehicles WHERE insurance_expiry IS NOT NULL
          AND insurance_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 45 DAY)
          ORDER BY insurance_expiry ASC LIMIT 5`),
        db.query(`SELECT i.id, i.created_at, i.driver_name, i.route, v.plate, v.brand, v.model
          FROM inspections i JOIN vehicles v ON i.vehicle_id=v.id
          WHERE i.result='fail' ORDER BY i.created_at DESC LIMIT 4`),
        db.query(`SELECT v.id, v.plate, v.brand, v.model, v.status, v.type,
          (SELECT result     FROM inspections WHERE vehicle_id=v.id ORDER BY created_at DESC LIMIT 1) AS last_result,
          (SELECT route      FROM inspections WHERE vehicle_id=v.id ORDER BY created_at DESC LIMIT 1) AS last_route,
          (SELECT created_at FROM inspections WHERE vehicle_id=v.id ORDER BY created_at DESC LIMIT 1) AS last_inspection,
          (SELECT scheduled_date FROM maintenance WHERE vehicle_id=v.id AND status!='completado' ORDER BY scheduled_date ASC LIMIT 1) AS next_service
          FROM vehicles v ORDER BY v.status='activo' DESC, v.plate LIMIT 10`),
      ]);

    const kpi = {
      active:       Number(vStats[0].active)    || 0,
      in_maint:     Number(vStats[0].in_maint)  || 0,
      total:        Number(vStats[0].total)      || 0,
      pending_insp: Number(pendingInsp[0].cnt)  || 0,
      availability: vStats[0].total > 0
        ? ((Number(vStats[0].active) / Number(vStats[0].total)) * 100).toFixed(1)
        : '100.0',
    };

    const DAY_ES = ['DO','LU','MA','MI','JU','VI','SA'];
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const row = chartRows.find(r => {
        const rk = (r.day instanceof Date ? r.day : new Date(r.day)).toISOString().split('T')[0];
        return rk === key;
      });
      chartData.push({ label: DAY_ES[d.getDay()], pass: row ? Number(row.pass_count) : 0, fail: row ? Number(row.fail_count) : 0 });
    }
    const maxBar = Math.max(...chartData.map(d => d.pass + d.fail), 1);

    res.render('dashboard/index', {
      title: 'Dashboard — FleetOps Command',
      kpi, chartData, maxBar, expiringIns, failedInsp, fleetList, today,
    });
  } catch (err) {
    next(err);
  }
};
