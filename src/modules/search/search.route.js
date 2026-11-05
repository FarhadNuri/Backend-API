const { Router } = require("express");
const { optionalAuth } = require("../../middlewares/auth");
const { validateRequest } = require("../../middlewares/validateRequest");
const { searchDoctorsSchema } = require("./search.validation");
const searchController = require("./search.controller");

const router = Router();

router.get(
  "/doctors",
  optionalAuth,
  validateRequest(searchDoctorsSchema, "query"),
  searchController.searchDoctors
);

module.exports = router;

