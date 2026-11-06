const express = require("express");
const cors = require("cors");
const { status } = require("http-status");
const { setupSwagger } = require("./docs/swagger");
const routes = require("./routes");
const { notFoundHandler } = require("./middlewares/notFoundHandler");
const { globalErrorHandler } = require("./utils/globalErrorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  const matchedPath = req.headers["x-matched-path"] || req.headers["x-forwarded-uri"];
  if (matchedPath && (req.url === "/src/app.js" || req.url === "/api")) {
    req.url = matchedPath;
  }
  next();
});

setupSwagger(app);

app.get("/", (_req, res) => {
  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: "Daktar Kothay Server is running successfully",
  });
});

app.get("/api", (_req, res) => {
  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: "Daktar Kothay Server is running successfully",
  });
});

app.use("/api", routes);
app.use("/", routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
