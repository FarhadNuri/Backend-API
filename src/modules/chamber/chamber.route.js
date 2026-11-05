const { Router } = require("express");
const { auth } = require("../../middlewares/auth");
const { validateRequest } = require("../../middlewares/validateRequest");
const {
  createChamberSchema,
  updateChamberSchema,
  chamberIdParamSchema,
} = require("./chamber.validation");
const chamberController = require("./chamber.controller");

const router = Router();

router.get("/", auth("DOCTOR"), chamberController.getChambers);

router.post(
  "/",
  auth("DOCTOR"),
  validateRequest(createChamberSchema),
  chamberController.createChamber
);

router.patch(
  "/:chamberId",
  auth("DOCTOR"),
  validateRequest(chamberIdParamSchema, "params"),
  validateRequest(updateChamberSchema),
  chamberController.updateChamber
);

router.delete(
  "/:chamberId",
  auth("DOCTOR"),
  validateRequest(chamberIdParamSchema, "params"),
  chamberController.deleteChamber
);

module.exports = router;

