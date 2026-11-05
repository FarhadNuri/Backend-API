const { status } = require("http-status");
const { query, withTransaction } = require("../../config/db");
const { AppError } = require("../../utils/AppError");

const getDoctorId = async (userId) => {
  const result = await query("SELECT id FROM doctors WHERE user_id = $1", [userId]);
  if (result.rowCount === 0) {
    throw new AppError(status.NOT_FOUND, "Doctor profile not found");
  }
  return result.rows[0].id;
};

const createChamber = async (userId, payload) => {
  const doctorId = await getDoctorId(userId);
  const { schedules, ...chamber } = payload;

  return withTransaction(async (client) => {
    const chamberResult = await client.query(
      `INSERT INTO chambers (doctor_id, name, address, city, area, lat, lng, phone, fee)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, address, city, area, lat, lng, phone, fee, is_active AS "isActive"`,
      [
        doctorId,
        chamber.name,
        chamber.address,
        chamber.city,
        chamber.area,
        chamber.lat,
        chamber.lng,
        chamber.phone || null,
        chamber.fee,
      ]
    );
    const created = chamberResult.rows[0];


    created.schedules = [];
    for (const s of schedules) {
      const scheduleResult = await client.query(
        `INSERT INTO chamber_schedules (chamber_id, day, start_time, end_time)
         VALUES ($1, $2, $3, $4)
         RETURNING id, day, start_time AS "startTime", end_time AS "endTime"`,
        [created.id, s.day, s.startTime, s.endTime]
      );
      created.schedules.push(scheduleResult.rows[0]);
    }

    return created;
  });
};


const getChambers = async (userId) => {
  const doctorId = await getDoctorId(userId);

  const chambersResult = await query(
    `SELECT id, name, address, city, area, lat, lng, phone, fee, is_active AS "isActive"
     FROM chambers
     WHERE doctor_id = $1
     ORDER BY created_at DESC`,
    [doctorId]
  );
  const chambers = chambersResult.rows;

  if (chambers.length > 0) {
    const chamberIds = chambers.map((c) => c.id);
    const schedulesResult = await query(
      `SELECT cs.id, cs.chamber_id AS "chamberId", cs.day,
              cs.start_time AS "startTime", cs.end_time AS "endTime"
       FROM chamber_schedules cs
       WHERE cs.chamber_id = ANY($1)
       ORDER BY CASE cs.day
         WHEN 'SAT' THEN 1
         WHEN 'SUN' THEN 2
         WHEN 'MON' THEN 3
         WHEN 'TUE' THEN 4
         WHEN 'WED' THEN 5
         WHEN 'THU' THEN 6
         WHEN 'FRI' THEN 7
       END, cs.start_time ASC`,
      [chamberIds]
    );

    const schedulesByChamber = {};
    for (const schedule of schedulesResult.rows) {
      if (!schedulesByChamber[schedule.chamberId]) {
        schedulesByChamber[schedule.chamberId] = [];
      }
      schedulesByChamber[schedule.chamberId].push({
        id: schedule.id,
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      });
    }

    chambers.forEach((chamber) => {
      chamber.schedules = schedulesByChamber[chamber.id] || [];
    });
  }

  return chambers;
};

const updateChamber = async (userId, chamberId, payload) => {
  const doctorId = await getDoctorId(userId);

  const chamberCheck = await query(
    'SELECT id, doctor_id AS "doctorId" FROM chambers WHERE id = $1',
    [chamberId]
  );
  if (chamberCheck.rowCount === 0) {
    throw new AppError(status.NOT_FOUND, "Chamber not found");
  }
  if (chamberCheck.rows[0].doctorId !== doctorId) {
    throw new AppError(status.FORBIDDEN, "You can only edit your own chamber");
  }

  const { schedules, ...fieldsToUpdate } = payload;

  return withTransaction(async (client) => {
    const updateClauses = [];
    const updateParams = [];
    let idx = 1;

    if (fieldsToUpdate.name !== undefined) {
      updateClauses.push(`name = $${idx++}`);
      updateParams.push(fieldsToUpdate.name);
    }
    if (fieldsToUpdate.address !== undefined) {
      updateClauses.push(`address = $${idx++}`);
      updateParams.push(fieldsToUpdate.address);
    }
    if (fieldsToUpdate.city !== undefined) {
      updateClauses.push(`city = $${idx++}`);
      updateParams.push(fieldsToUpdate.city);
    }
    if (fieldsToUpdate.area !== undefined) {
      updateClauses.push(`area = $${idx++}`);
      updateParams.push(fieldsToUpdate.area);
    }
    if (fieldsToUpdate.lat !== undefined) {
      updateClauses.push(`lat = $${idx++}`);
      updateParams.push(fieldsToUpdate.lat);
    }
    if (fieldsToUpdate.lng !== undefined) {
      updateClauses.push(`lng = $${idx++}`);
      updateParams.push(fieldsToUpdate.lng);
    }
    if (fieldsToUpdate.phone !== undefined) {
      updateClauses.push(`phone = $${idx++}`);
      updateParams.push(fieldsToUpdate.phone);
    }
    if (fieldsToUpdate.fee !== undefined) {
      updateClauses.push(`fee = $${idx++}`);
      updateParams.push(fieldsToUpdate.fee);
    }
    if (fieldsToUpdate.isActive !== undefined) {
      updateClauses.push(`is_active = $${idx++}`);
      updateParams.push(fieldsToUpdate.isActive);
    }

    if (updateClauses.length > 0) {
      updateClauses.push("updated_at = now()");
      updateParams.push(chamberId);
      await client.query(
        `UPDATE chambers SET ${updateClauses.join(", ")} WHERE id = $${idx}`,
        updateParams
      );
    }

    if (schedules) {
      await client.query("DELETE FROM chamber_schedules WHERE chamber_id = $1", [chamberId]);

      for (const s of schedules) {
        await client.query(
          `INSERT INTO chamber_schedules (chamber_id, day, start_time, end_time)
           VALUES ($1, $2, $3, $4)`,
          [chamberId, s.day, s.startTime, s.endTime]
        );
      }
    }

    const chamberResult = await client.query(
      `SELECT id, name, address, city, area, lat, lng, phone, fee, is_active AS "isActive"
       FROM chambers
       WHERE id = $1`,
      [chamberId]
    );
    const updated = chamberResult.rows[0];

    const schedulesResult = await client.query(
      `SELECT id, day, start_time AS "startTime", end_time AS "endTime"
       FROM chamber_schedules
       WHERE chamber_id = $1
       ORDER BY CASE day
         WHEN 'SAT' THEN 1
         WHEN 'SUN' THEN 2
         WHEN 'MON' THEN 3
         WHEN 'TUE' THEN 4
         WHEN 'WED' THEN 5
         WHEN 'THU' THEN 6
         WHEN 'FRI' THEN 7
       END, start_time ASC`,
      [chamberId]
    );
    updated.schedules = schedulesResult.rows;

    return updated;
  });
};

const deleteChamber = async (userId, chamberId) => {
  const doctorId = await getDoctorId(userId);

  const chamberCheck = await query(
    'SELECT id, doctor_id AS "doctorId" FROM chambers WHERE id = $1',
    [chamberId]
  );
  if (chamberCheck.rowCount === 0) {
    throw new AppError(status.NOT_FOUND, "Chamber not found");
  }
  if (chamberCheck.rows[0].doctorId !== doctorId) {
    throw new AppError(status.FORBIDDEN, "You can only edit your own chamber");
  }

  await query("DELETE FROM chambers WHERE id = $1", [chamberId]);
};

module.exports = {
  createChamber,
  getChambers,
  updateChamber,
  deleteChamber,
};

