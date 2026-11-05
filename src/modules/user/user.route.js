const { Router } = require("express");
const { auth } = require("../../middlewares/auth");
const { validateRequest } = require("../../middlewares/validateRequest");
const { updateLocationSchema } = require("./user.validation");
const userController = require("./user.controller");

const router = Router();

router.get("/me", auth("USER"), userController.getProfile);

router.patch(
  "/me/location",
  auth("USER"),
  validateRequest(updateLocationSchema),
  userController.updateLocation
);

module.exports = router;

