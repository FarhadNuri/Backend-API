const { status } = require("http-status");
const { handleAsync } = require("../../utils/handleAsync");
const { sendResponse } = require("../../utils/sendResponse");
const adminService = require("./admin.service");


const listDoctors = handleAsync(async (req, res) => {
  const result = await adminService.listDoctors(req.query);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Doctors fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});


const approveDoctor = handleAsync(async (req, res) => {
  const doctor = await adminService.approveDoctor(req.params.id);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Doctor approved successfully",
    data: doctor,
  });
});


const rejectDoctor = handleAsync(async (req, res) => {
  const doctor = await adminService.rejectDoctor(req.params.id);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Doctor rejected",
    data: doctor,
  });
});

const addDoctor = handleAsync(async (req, res) => {
  const doctor = await adminService.addDoctor(req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    message: "Doctor added successfully",
    data: doctor,
  });
});

module.exports = {
  listDoctors,
  approveDoctor,
  rejectDoctor,
  addDoctor,
};

