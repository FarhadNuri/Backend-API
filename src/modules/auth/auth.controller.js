const { status } = require("http-status");
const { handleAsync } = require("../../utils/handleAsync");
const { sendResponse } = require("../../utils/sendResponse");
const authService = require("./auth.service");

const registerUser = handleAsync(async (req, res) => {
  const result = await authService.registerUser(req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    message: "User registered successfully",
    data: result,
  });
});

const registerDoctor = handleAsync(async (req, res) => {
  const result = await authService.registerDoctor(req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    message: "Doctor registered. Waiting for admin approval",
    data: result,
  });
});

const login = handleAsync(async (req, res) => {
  const result = await authService.login(req.body);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Login successful",
    data: result,
  });
});

module.exports = {
  registerUser,
  registerDoctor,
  login,
};

