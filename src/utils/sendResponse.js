const sendResponse = (res, { statusCode, message, data, meta }) => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    meta,
  });
};

module.exports = { sendResponse };

