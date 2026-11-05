const { status } = require("http-status");
const { query, withTransaction } = require("../../config/db");
const { AppError } = require("../../utils/AppError");


const getDoctorProfile = async (userId) => {
  const doctorResult = await query(
    `SELECT d.id, u.name, u.email, u.phone, d.bmdc_number AS "bmdcNumber",
            s.id AS "specialtyId", s.name AS "specialtyName",
            d.degrees, d.experience_years AS "experienceYears", d.bio, d.status
     FROM doctors d
     JOIN users u ON u.id = d.user_id
     JOIN specialties s ON s.id = d.specialty_id
     WHERE d.user_id = $1`,
    [userId]
  );

  if (doctorResult.rowCount === 0) {
    throw new AppError(status.NOT_FOUND, "Doctor profile not found");
  }

  const doc = doctorResult.rows[0];

  const chambersResult = await query(
    `SELECT c.id, c.name, c.address, c.city, c.area, c.lat, c.lng, c.phone, c.fee,
            c.is_active AS "isActive"
     FROM chambers c
     WHERE c.doctor_id = $1
     ORDER BY c.created_at ASC`,
    [doc.id]
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

  const hasBio = Boolean(doc.bio && doc.bio.trim().length > 0);
  const hasDegrees = Boolean(doc.degrees && doc.degrees.length > 0);
  const hasChamber = Boolean(chambers.some((c) => c.isActive));

  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    bmdcNumber: doc.bmdcNumber,
    specialty: {
      id: doc.specialtyId,
      name: doc.specialtyName,
    },
    degrees: doc.degrees,
    experienceYears: doc.experienceYears,
    bio: doc.bio,
    status: doc.status,
    chambers,
    completion: {
      hasBio,
      hasDegrees,
      hasChamber,
    },
  };
};

const updateDoctorProfile = async (userId, payload) => {
  const { name, phone, specialtyId, degrees, experienceYears, bio } = payload;

  const doctorCheck = await query(
    "SELECT id FROM doctors WHERE user_id = $1",
    [userId]
  );
  if (doctorCheck.rowCount === 0) {
    throw new AppError(status.NOT_FOUND, "Doctor profile not found");
  }

  if (specialtyId) {
    const specialtyCheck = await query(
      "SELECT id, name FROM specialties WHERE id = $1",
      [specialtyId]
    );
    if (specialtyCheck.rowCount === 0) {
      throw new AppError(status.NOT_FOUND, "Specialty not found");
    }
  }

  return withTransaction(async (client) => {
    if (name !== undefined || phone !== undefined) {
      await client.query(
        `UPDATE users
         SET name = COALESCE($1, name),
             phone = COALESCE($2, phone),
             updated_at = now()
         WHERE id = $3`,
        [name || null, phone || null, userId]
      );
    }

    if (
      specialtyId !== undefined ||
      degrees !== undefined ||
      experienceYears !== undefined ||
      bio !== undefined
    ) {
      await client.query(
        `UPDATE doctors
         SET specialty_id = COALESCE($1, specialty_id),
             degrees = COALESCE($2, degrees),
             experience_years = COALESCE($3, experience_years),
             bio = COALESCE($4, bio),
             updated_at = now()
         WHERE user_id = $5`,
        [
          specialtyId || null,
          degrees || null,
          experienceYears !== undefined ? experienceYears : null,
          bio !== undefined ? bio : null,
          userId,
        ]
      );
    }

    const result = await client.query(
      `SELECT d.id, u.name,
              s.id AS "specialtyId", s.name AS "specialtyName",
              d.degrees, d.experience_years AS "experienceYears", d.bio, d.status
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       JOIN specialties s ON s.id = d.specialty_id
       WHERE d.user_id = $1`,
      [userId]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      specialty: {
        id: row.specialtyId,
        name: row.specialtyName,
      },
      degrees: row.degrees,
      experienceYears: row.experienceYears,
      bio: row.bio,
      status: row.status,
    };
  });
};

const getPublicDoctorDetails = async (doctorId) => {
  const doctorResult = await query(
    `SELECT d.id, u.name,
            s.id AS "specialtyId", s.name AS "specialtyName",
            d.degrees, d.experience_years AS "experienceYears", d.bio, d.status
     FROM doctors d
     JOIN users u ON u.id = d.user_id
     JOIN specialties s ON s.id = d.specialty_id
     WHERE d.id = $1 AND d.status = 'VERIFIED'`,
    [doctorId]
  );

  if (doctorResult.rowCount === 0) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  const doc = doctorResult.rows[0];

  const chambersResult = await query(
    `SELECT c.id, c.name, c.address, c.area, c.city, c.lat, c.lng, c.phone, c.fee,
            c.is_active AS "isActive"
     FROM chambers c
     WHERE c.doctor_id = $1 AND c.is_active = true
     ORDER BY c.created_at ASC`,
    [doc.id]
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

  return {
    id: doc.id,
    name: doc.name,
    specialty: {
      id: doc.specialtyId,
      name: doc.specialtyName,
    },
    degrees: doc.degrees,
    experienceYears: doc.experienceYears,
    bio: doc.bio,
    chambers,
  };
};

module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  getPublicDoctorDetails,
};

