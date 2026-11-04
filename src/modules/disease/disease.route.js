const { Router } = require("express");
const { validateRequest } = require("../../middlewares/validateRequest");
const { getDiseasesSchema } = require("./disease.validation");
const diseaseController = require("./disease.controller");

const router = Router();

router.get(
  "/diseases",
  validateRequest(getDiseasesSchema, "query"),
  diseaseController.getDiseases
);

router.get("/specialties", diseaseController.getSpecialties);

module.exports = router;

