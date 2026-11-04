const { query } = require("../../config/db");

/**
 * @param {object} params 
 * @returns {Promise<Array<object>>} list of matched diseases with specialty info
 */
const getDiseases = async ({ q, limit = 10 }) => {
  const searchTerm = `%${q.trim()}%`;

  const result = await query(
    `SELECT dz.id, dz.name, s.id AS "specialtyId", s.name AS "specialtyName"
     FROM diseases dz
     JOIN specialties s ON s.id = dz.specialty_id
     WHERE dz.name ILIKE $1
        OR EXISTS (SELECT 1 FROM unnest(dz.aliases) AS a WHERE a ILIKE $1)
     ORDER BY dz.name ASC
     LIMIT $2`,
    [searchTerm, limit]
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    specialty: {
      id: row.specialtyId,
      name: row.specialtyName,
    },
  }));
};

/**
 * @returns {Promise<Array<object>>} 
 */
const getSpecialties = async () => {
  const result = await query(
    `SELECT id, name
     FROM specialties
     ORDER BY name ASC`
  );

  return result.rows;
};

/**
 * @param {string} text 
 * @returns {Promise<object|null>}
 */
const findDiseaseByText = async (text) => {
  if (!text || typeof text !== "string") {
    return null;
  }

  const cleaned = text.trim().toLowerCase();
  if (!cleaned) {
    return null;
  }

  const exactResult = await query(
    `SELECT dz.id, dz.name, s.id AS "specialtyId", s.name AS "specialtyName"
     FROM diseases dz
     JOIN specialties s ON s.id = dz.specialty_id
     WHERE lower(dz.name) = $1
        OR $1 = ANY(dz.aliases)
     LIMIT 1`,
    [cleaned]
  );

  if (exactResult.rowCount > 0) {
    const row = exactResult.rows[0];
    return {
      id: row.id,
      name: row.name,
      specialty: {
        id: row.specialtyId,
        name: row.specialtyName,
      },
    };
  }

  const partialResult = await query(
    `SELECT dz.id, dz.name, s.id AS "specialtyId", s.name AS "specialtyName"
     FROM diseases dz
     JOIN specialties s ON s.id = dz.specialty_id
     WHERE dz.name ILIKE $1
     ORDER BY dz.name ASC
     LIMIT 1`,
    [`%${cleaned}%`]
  );

  if (partialResult.rowCount > 0) {
    const row = partialResult.rows[0];
    return {
      id: row.id,
      name: row.name,
      specialty: {
        id: row.specialtyId,
        name: row.specialtyName,
      },
    };
  }

  return null;
};

module.exports = {
  getDiseases,
  getSpecialties,
  findDiseaseByText,
};

