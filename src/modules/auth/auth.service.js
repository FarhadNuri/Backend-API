const bcrypt = require("bcrypt");
const { status } = require("http-status");
const { query, withTransaction } = require("../../config/db");
const { env } = require("../../config/envConfig");
const { AppError } = require("../../utils/AppError");
const { signToken } = require("../../utils/tokens");

/**
 * @param {object} payload
 * @returns {Promise<{user: object, token: string}>} 
 */
const registerUser = async (payload) => {
  const { name, email, password, phone, city, area, lat, lng } = payload;

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  return withTransaction(async (client) => {
    const userResult = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'USER')
       RETURNING id, name, email, phone, role`,
      [name, email, phone || null, passwordHash]
    );
    const user = userResult.rows[0];

    const hasLocation = city || area || lat !== undefined || lng !== undefined;
    if (hasLocation) {
      await client.query(
        `INSERT INTO user_profiles (user_id, city, area, lat, lng)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, city || null, area || null, lat !== undefined ? lat : null, lng !== undefined ? lng : null]
      );
    }
    const token = signToken({ userId: user.id, role: user.role });

    return { user, token };
  });
};

/**
 * @param {object} payload 
 * @returns {Promise<{user: object, doctor: object, token: string}>}
 */
const registerDoctor = async (payload) => {
  const { name, email, phone, password, bmdcNumber, specialtyId } = payload;

  const specialtyResult = await query(
    "SELECT id, name FROM specialties WHERE id = $1",
    [specialtyId]
  );
  if (specialtyResult.rowCount === 0) {
    throw new AppError(status.NOT_FOUND, "Specialty not found");
  }
  const specialty = specialtyResult.rows[0];

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  return withTransaction(async (client) => {
    const userResult = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'DOCTOR')
       RETURNING id, name, email, role`,
      [name, email, phone, passwordHash]
    );
    const user = userResult.rows[0];

    const doctorResult = await client.query(
      `INSERT INTO doctors (user_id, specialty_id, bmdc_number, status)
       VALUES ($1, $2, $3, 'PENDING')
       RETURNING id, bmdc_number AS "bmdcNumber", status`,
      [user.id, specialtyId, bmdcNumber]
    );
    const doctor = doctorResult.rows[0];

    const token = signToken({ userId: user.id, role: user.role });

    return {
      user,
      doctor: {
        id: doctor.id,
        bmdcNumber: doctor.bmdcNumber,
        status: doctor.status,
        specialty: {
          id: specialty.id,
          name: specialty.name,
        },
      },
      token,
    };
  });
};

/**
 * @param {object} credentials
 * @returns {Promise<{token: string, user: object}>}
 */
const login = async (credentials) => {
  const { email, password } = credentials;

  const result = await query(
    `SELECT id, name, email, password_hash AS "passwordHash", role, is_active AS "isActive"
     FROM users
     WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new AppError(status.FORBIDDEN, "Account is deactivated");
  }

  const token = signToken({ userId: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = {
  registerUser,
  registerDoctor,
  login,
};

