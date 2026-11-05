const { status } = require("http-status");
const { query } = require("../../config/db");
const { AppError } = require("../../utils/AppError");
const { getBoundingBox } = require("../../utils/geo");
const { findDiseaseByText } = require("../disease/disease.service");

const resolveLocation = async ({ lat, lng, area, city }, userId) => {
  if (lat !== undefined && lng !== undefined) {
    return { lat, lng };
  }

  if (area) {
    let areaResult;
    if (city) {
      areaResult = await query(
        `SELECT lat, lng FROM areas WHERE lower(name) = lower($1) AND lower(city) = lower($2) LIMIT 1`,
        [area, city]
      );
    } else {
      areaResult = await query(
        `SELECT lat, lng FROM areas WHERE lower(name) = lower($1) LIMIT 1`,
        [area]
      );
    }

    if (areaResult.rowCount === 0) {
      throw new AppError(status.NOT_FOUND, "Area not found");
    }

    return {
      lat: Number(areaResult.rows[0].lat),
      lng: Number(areaResult.rows[0].lng),
    };
  }

  if (userId) {
    const profileResult = await query(
      `SELECT lat, lng FROM user_profiles WHERE user_id = $1`,
      [userId]
    );

    if (
      profileResult.rowCount > 0 &&
      profileResult.rows[0].lat !== null &&
      profileResult.rows[0].lng !== null
    ) {
      return {
        lat: Number(profileResult.rows[0].lat),
        lng: Number(profileResult.rows[0].lng),
      };
    }
  }

  throw new AppError(
    status.BAD_REQUEST,
    "Location is required. Send lat and lng, or area, or save your location"
  );
};

const searchDoctors = async (queryParams, userId) => {
  const {
    disease,
    specialtyId,
    name,
    area,
    city,
    lat,
    lng,
    radius = 5,
    maxFee,
    day,
    page = 1,
    limit = 10,
  } = queryParams;

  const location = await resolveLocation({ lat, lng, area, city }, userId);

  let matchedDisease = null;
  let targetSpecialtyId = specialtyId || null;

  if (disease) {
    const foundDisease = await findDiseaseByText(disease);
    if (!foundDisease) {
      return {
        data: [],
        meta: {
          page,
          limit,
          total: 0,
        },
        message: "No matching disease found",
      };
    }

    matchedDisease = {
      id: foundDisease.id,
      name: foundDisease.name,
      specialty: foundDisease.specialty.name,
    };

    if (!targetSpecialtyId) {
      targetSpecialtyId = foundDisease.specialty.id;
    }
  }

  const box = getBoundingBox(location.lat, location.lng, radius);

  const params = [];
  const add = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  const latParam = add(location.lat);
  const lngParam = add(location.lng);

  let conditions = `
    d.status = 'VERIFIED'
    AND c.is_active = true
    AND c.lat BETWEEN ${add(box.minLat)} AND ${add(box.maxLat)}
    AND c.lng BETWEEN ${add(box.minLng)} AND ${add(box.maxLng)}`;

  if (targetSpecialtyId) {
    conditions += ` AND d.specialty_id = ${add(targetSpecialtyId)}`;
  }
  if (name) {
    conditions += ` AND u.name ILIKE ${add(`%${name}%`)}`;
  }
  if (maxFee) {
    conditions += ` AND c.fee <= ${add(maxFee)}`;
  }
  if (day) {
    conditions += ` AND EXISTS (
      SELECT 1 FROM chamber_schedules cs
      WHERE cs.chamber_id = c.id AND cs.day = ${add(day)})`;
  }

  const radiusParam = add(radius);

  const countSql = `
    SELECT COUNT(*)::int
    FROM (
      SELECT (6371 * acos(LEAST(1.0, GREATEST(-1.0,
          cos(radians(${latParam})) * cos(radians(c.lat)) * cos(radians(c.lng) - radians(${lngParam}))
        + sin(radians(${latParam})) * sin(radians(c.lat))
      )))) AS "distanceKm"
      FROM chambers c
      JOIN doctors d ON d.id = c.doctor_id
      JOIN users u ON u.id = d.user_id
      JOIN specialties s ON s.id = d.specialty_id
      WHERE ${conditions}
    ) t
    WHERE t."distanceKm" <= ${radiusParam}`;

  const countResult = await query(countSql, [...params]);
  const total = countResult.rows[0].count;

  const offset = (page - 1) * limit;
  const limitParam = add(limit);
  const offsetParam = add(offset);

  const dataSql = `
    SELECT * FROM (
      SELECT
        c.id AS "chamberId",
        d.id AS "doctorId",
        u.name AS "name",
        s.name AS "specialty",
        d.degrees AS "degrees",
        d.experience_years AS "experienceYears",
        c.name AS "chamberName",
        c.address, c.area, c.city, c.lat, c.lng, c.phone, c.fee,
        (6371 * acos(LEAST(1.0, GREATEST(-1.0,
            cos(radians(${latParam})) * cos(radians(c.lat)) * cos(radians(c.lng) - radians(${lngParam}))
          + sin(radians(${latParam})) * sin(radians(c.lat))
        )))) AS "distanceKm"
      FROM chambers c
      JOIN doctors d ON d.id = c.doctor_id
      JOIN users u ON u.id = d.user_id
      JOIN specialties s ON s.id = d.specialty_id
      WHERE ${conditions}
    ) t
    WHERE t."distanceKm" <= ${radiusParam}
    ORDER BY t."distanceKm" ASC
    LIMIT ${limitParam} OFFSET ${offsetParam}`;

  const dataResult = await query(dataSql, params);
  const rows = dataResult.rows;

  const schedulesByChamber = {};
  if (rows.length > 0) {
    const chamberIds = rows.map((r) => r.chamberId);
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
  }

  const formattedData = rows.map((row) => ({
    doctorId: row.doctorId,
    name: row.name,
    specialty: row.specialty,
    degrees: row.degrees,
    experienceYears: Number(row.experienceYears),
    distanceKm: Number(Number(row.distanceKm).toFixed(1)),
    chamber: {
      id: row.chamberId,
      name: row.chamberName,
      address: row.address,
      area: row.area,
      city: row.city,
      lat: Number(row.lat),
      lng: Number(row.lng),
      phone: row.phone,
      fee: Number(row.fee),
      schedules: schedulesByChamber[row.chamberId] || [],
    },
  }));

  return {
    data: formattedData,
    meta: {
      page,
      limit,
      total,
      ...(matchedDisease ? { matchedDisease } : {}),
    },
    message: "Doctors fetched successfully",
  };
};

module.exports = {
  searchDoctors,
  resolveLocation,
};

