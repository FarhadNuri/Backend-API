const { status } = require("http-status");
const { handleAsync } = require("../../utils/handleAsync");
const { sendResponse } = require("../../utils/sendResponse");
const doctorService = require("./doctor.service");

const getDoctorProfile = handleAsync(async (req, res) => {
  const profile = await doctorService.getDoctorProfile(req.user.id);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Doctor profile fetched successfully",
    data: profile,
  });
});

const updateDoctorProfile = handleAsync(async (req, res) => {
  const updated = await doctorService.updateDoctorProfile(req.user.id, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Profile updated successfully",
    data: updated,
  });
});

const getPublicDoctorDetails = handleAsync(async (req, res) => {
  const doctor = await doctorService.getPublicDoctorDetails(req.params.id);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Doctor fetched successfully",
    data: doctor,
  });
});

module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  getPublicDoctorDetails,
};

