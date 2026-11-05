const { status } = require("http-status");
const { handleAsync } = require("../../utils/handleAsync");
const { sendResponse } = require("../../utils/sendResponse");
const chamberService = require("./chamber.service");

const getChambers = handleAsync(async (req, res) => {
  const chambers = await chamberService.getChambers(req.user.id);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Chambers fetched successfully",
    data: chambers,
  });
});

const createChamber = handleAsync(async (req, res) => {
  const chamber = await chamberService.createChamber(req.user.id, req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    message: "Chamber created successfully",
    data: chamber,
  });
});


const updateChamber = handleAsync(async (req, res) => {
  const chamber = await chamberService.updateChamber(
    req.user.id,
    req.params.chamberId,
    req.body
  );

  sendResponse(res, {
    statusCode: status.OK,
    message: "Chamber updated successfully",
    data: chamber,
  });
});

const deleteChamber = handleAsync(async (req, res) => {
  await chamberService.deleteChamber(req.user.id, req.params.chamberId);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Chamber deleted successfully",
  });
});

module.exports = {
  getChambers,
  createChamber,
  updateChamber,
  deleteChamber,
};

