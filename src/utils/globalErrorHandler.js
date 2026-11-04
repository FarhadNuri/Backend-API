const { ZodError } = require("zod");
const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken");
const { AppError } = require("./AppError");
const { logger } = require("./logger");
const { env } = require("../config/envConfig");


const globalErrorHandler = (err, req, res, _next) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorDetails;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errorDetails = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err.code === "23505") {
    statusCode = 409;
    message = "A record with this value already exists";
    const match = /Key \((.+?)\)=/.exec(err.detail || "");
    errorDetails = match ? match[1] : err.constraint;
  } else if (err.code === "23503") {
    statusCode = 400;
    message = "Invalid reference id";
  } else if (err.code === "22P02") {
    statusCode = 400;
    message = "Invalid id format";
  } else if (err.code === "23514") {
    statusCode = 400;
    message = "A value is not allowed";
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Token expired, please login again";
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token";
  } else if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON in request body";
  }

  logger.error(message, { path: req.originalUrl, stack: err.stack });

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorDetails,
    stack: env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = { globalErrorHandler };

