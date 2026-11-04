const fs = require("fs");
const path = require("path");
const { pool } = require("../config/db");

const init = async () => {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("Database schema is ready");
  await pool.end();
};

init().catch((error) => {
  console.error("Database init failed:", error.message);
  process.exit(1);
});

