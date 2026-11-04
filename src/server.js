const app = require("./app");
const { connectDB, disconnectDB } = require("./config/db");
const { env } = require("./config/envConfig");
const { logger } = require("./utils/logger");

let server;

const startServer = async () => {
  try {

    await connectDB();
    server = app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  logger.info(`${signal} signal received. Closing server...`);
  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed");
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();

