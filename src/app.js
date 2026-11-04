const express = require("express");
const cors = require("cors");
const { setupSwagger } = require("./docs/swagger");
const routes = require("./routes");
const { notFoundHandler } = require("./middlewares/notFoundHandler");
const { globalErrorHandler } = require("./utils/globalErrorHandler");

const app = express();

app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use("/api", routes);
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;

