const { status } = require("http-status");

const notFoundHandler = (req, res) => {
  res.status(status.NOT_FOUND).json({
    success: false,
    statusCode: status.NOT_FOUND,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { notFoundHandler };

