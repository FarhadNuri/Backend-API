const { status } = require("http-status");
const { handleAsync } = require("../../utils/handleAsync");
const { sendResponse } = require("../../utils/sendResponse");
const diseaseService = require("./disease.service");

const getDiseases = handleAsync(async (req, res) => {
  const diseases = await diseaseService.getDiseases(req.query);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Diseases fetched successfully",
    data: diseases,
  });
});

const getSpecialties = handleAsync(async (_req, res) => {
  const specialties = await diseaseService.getSpecialties();

  sendResponse(res, {
    statusCode: status.OK,
    message: "Specialties fetched successfully",
    data: specialties,
  });
});

module.exports = {
  getDiseases,
  getSpecialties,
};

