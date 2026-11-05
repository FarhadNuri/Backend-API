const { status } = require("http-status");
const { handleAsync } = require("../../utils/handleAsync");
const { sendResponse } = require("../../utils/sendResponse");
const searchService = require("./search.service");

const searchDoctors = handleAsync(async (req, res) => {
  const result = await searchService.searchDoctors(req.query, req.user?.id);

  sendResponse(res, {
    statusCode: status.OK,
    message: result.message,
    data: result.data,
    meta: result.meta,
  });
});

module.exports = {
  searchDoctors,
};

