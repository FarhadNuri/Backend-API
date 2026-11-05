const { status } = require("http-status");
const { handleAsync } = require("../../utils/handleAsync");
const { sendResponse } = require("../../utils/sendResponse");
const userService = require("./user.service");

const getProfile = handleAsync(async (req, res) => {
  const user = await userService.getProfile(req.user.id);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Profile fetched successfully",
    data: user,
  });
});

const updateLocation = handleAsync(async (req, res) => {
  const location = await userService.updateLocation(req.user.id, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Location updated successfully",
    data: location,
  });
});

module.exports = {
  getProfile,
  updateLocation,
};

