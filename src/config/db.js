const { Pool } = require("pg");
const { env } = require("./envConfig");
const { logger } = require("../utils/logger");

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
});

const query = (text, params) => pool.query(text, params);

const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const connectDB = async () => {
  await pool.query("SELECT 1");
  logger.info("Database connected");
};

const disconnectDB = async () => {
  await pool.end();
  logger.info("Database disconnected");
};

module.exports = { pool, query, withTransaction, connectDB, disconnectDB };

