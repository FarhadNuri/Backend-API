const { status } = require("http-status");
const { query } = require("../../config/db");
const { AppError } = require("../../utils/AppError");

/**
 * @param {string} userId 
 * @returns {Promise<object>} 
 */
const getProfile = async (userId) => {
  const result = await query(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at AS "createdAt",
            p.city, p.area, p.lat, p.lng
     FROM users u
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE u.id = $1`,
    [userId]
  );

  if (result.rowCount === 0) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const row = result.rows[0];

  const hasProfile =
    row.city !== null ||
    row.area !== null ||
    row.lat !== null ||
    row.lng !== null;

  const profile = hasProfile
    ? {
        city: row.city,
        area: row.area,
        lat: row.lat,
        lng: row.lng,
      }
    : null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    createdAt: row.createdAt,
    profile,
  };
};

/**
 * @param {string} userId 
 * @param {object} payload 
 * @returns {Promise<object>} 
 */
const updateLocation = async (userId, payload) => {
  const { lat, lng, city, area } = payload;

  const result = await query(
    `INSERT INTO user_profiles (user_id, lat, lng, city, area)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id)
     DO UPDATE SET
       lat = EXCLUDED.lat,
       lng = EXCLUDED.lng,
       city = CASE WHEN $4 IS NOT NULL THEN EXCLUDED.city ELSE user_profiles.city END,
       area = CASE WHEN $5 IS NOT NULL THEN EXCLUDED.area ELSE user_profiles.area END
     RETURNING city, area, lat, lng`,
    [userId, lat, lng, city || null, area || null]
  );

  return result.rows[0];
};

module.exports = {
  getProfile,
  updateLocation,
};

