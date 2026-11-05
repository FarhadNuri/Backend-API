const bcrypt = require("bcrypt");
const { status } = require("http-status");
const { query, withTransaction } = require("../../config/db");
const { env } = require("../../config/envConfig");
const { AppError } = require("../../utils/AppError");


const listDoctors = async ({ status: doctorStatus, page, limit }) => {
  const offset = (page - 1) * limit;

  const countResult = await query(
    `SELECT COUNT(*)::int AS total
     FROM doctors
     WHERE status = $1`,
    [doctorStatus]
  );
  const total = countResult.rows[0].total;

  const doctorsResult = await query(
    `SELECT
       d.id,
       u.name,
       u.email,
       u.phone,
       d.bmdc_number AS "bmdcNumber",
       s.id AS "specialtyId",
       s.name AS "specialtyName",
       d.status,
       COUNT(c.id)::int AS "chamberCount",
       d.created_at AS "createdAt"
     FROM doctors d
     JOIN users u ON u.id = d.user_id
     JOIN specialties s ON s.id = d.specialty_id
     LEFT JOIN chambers c ON c.doctor_id = d.id
     WHERE d.status = $1
     GROUP BY d.id, u.name, u.email, u.phone, d.bmdc_number, s.id, s.name, d.status, d.created_at
     ORDER BY d.created_at DESC
     LIMIT $2 OFFSET $3`,
    [doctorStatus, limit, offset]
  );

  const data = doctorsResult.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    bmdcNumber: row.bmdcNumber,
    specialty: {
      id: row.specialtyId,
      name: row.specialtyName,
    },
    status: row.status,
    chamberCount: Number(row.chamberCount),
    createdAt: row.createdAt,
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total,
    },
  };
};


const approveDoctor = async (doctorId) => {
  const doctorResult = await query(
    `SELECT d.id, u.name, d.status
     FROM doctors d
     JOIN users u ON u.id = d.user_id
     WHERE d.id = $1`,
    [doctorId]
  );

  const doctor = doctorResult.rows[0];
  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  if (doctor.status === "VERIFIED") {
    throw new AppError(status.CONFLICT, "Doctor is already verified");
  }

  await query(
    `UPDATE doctors
     SET status = 'VERIFIED', updated_at = now()
     WHERE id = $1`,
    [doctorId]
  );

  return {
    id: doctor.id,
    name: doctor.name,
    status: "VERIFIED",
  };
};


const rejectDoctor = async (doctorId) => {
  const doctorResult = await query(
    `SELECT d.id, u.name, d.status
     FROM doctors d
     JOIN users u ON u.id = d.user_id
     WHERE d.id = $1`,
    [doctorId]
  );

  const doctor = doctorResult.rows[0];
  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  if (doctor.status === "REJECTED") {
    throw new AppError(status.CONFLICT, "Doctor is already rejected");
  }

  await query(
    `UPDATE doctors
     SET status = 'REJECTED', updated_at = now()
     WHERE id = $1`,
    [doctorId]
  );

  return {
    id: doctor.id,
    name: doctor.name,
    status: "REJECTED",
  };
};


const addDoctor = async (payload) => {
  const {
    name,
    email,
    phone,
    tempPassword,
    bmdcNumber,
    specialtyId,
    degrees = [],
    experienceYears = 0,
    bio = null,
    chambers = [],
  } = payload;

  const specialtyResult = await query(
    `SELECT id, name FROM specialties WHERE id = $1`,
    [specialtyId]
  );
  const specialty = specialtyResult.rows[0];
  if (!specialty) {
    throw new AppError(status.NOT_FOUND, "Specialty not found");
  }

  const passwordHash = await bcrypt.hash(tempPassword, env.BCRYPT_SALT_ROUNDS);

  return withTransaction(async (client) => {
    const userResult = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'DOCTOR')
       RETURNING id, name, email`,
      [name, email, phone, passwordHash]
    );
    const user = userResult.rows[0];

    const doctorResult = await client.query(
      `INSERT INTO doctors (user_id, specialty_id, bmdc_number, degrees, experience_years, bio, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'VERIFIED')
       RETURNING id, bmdc_number AS "bmdcNumber", status`,
      [user.id, specialty.id, bmdcNumber, degrees, experienceYears, bio || null]
    );
    const doctor = doctorResult.rows[0];

    const createdChambers = [];
    for (const ch of chambers) {
      const chamberResult = await client.query(
        `INSERT INTO chambers (doctor_id, name, address, city, area, lat, lng, phone, fee, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
         RETURNING id, name, address, city, area, lat, lng, phone, fee, is_active AS "isActive"`,
        [
          doctor.id,
          ch.name,
          ch.address,
          ch.city,
          ch.area,
          ch.lat,
          ch.lng,
          ch.phone || null,
          ch.fee,
        ]
      );
      const createdChamber = chamberResult.rows[0];

      const createdSchedules = [];
      for (const s of ch.schedules) {
        const schedResult = await client.query(
          `INSERT INTO chamber_schedules (chamber_id, day, start_time, end_time)
           VALUES ($1, $2, $3, $4)
           RETURNING id, day, start_time AS "startTime", end_time AS "endTime"`,
          [createdChamber.id, s.day, s.startTime, s.endTime]
        );
        createdSchedules.push({
          id: schedResult.rows[0].id,
          day: schedResult.rows[0].day,
          startTime: schedResult.rows[0].startTime,
          endTime: schedResult.rows[0].endTime,
        });
      }

      createdChambers.push({
        id: createdChamber.id,
        name: createdChamber.name,
        address: createdChamber.address,
        city: createdChamber.city,
        area: createdChamber.area,
        lat: Number(createdChamber.lat),
        lng: Number(createdChamber.lng),
        phone: createdChamber.phone,
        fee: Number(createdChamber.fee),
        isActive: createdChamber.isActive,
        schedules: createdSchedules,
      });
    }

    return {
      id: doctor.id,
      name: user.name,
      email: user.email,
      bmdcNumber: doctor.bmdcNumber,
      specialty: {
        id: specialty.id,
        name: specialty.name,
      },
      status: doctor.status,
      chambers: createdChambers,
    };
  });
};

module.exports = {
  listDoctors,
  approveDoctor,
  rejectDoctor,
  addDoctor,
};

