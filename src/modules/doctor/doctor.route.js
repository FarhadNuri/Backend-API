const { Router } = require("express");
const { auth } = require("../../middlewares/auth");
const { validateRequest } = require("../../middlewares/validateRequest");
const {
  updateDoctorProfileSchema,
  doctorIdParamSchema,
} = require("./doctor.validation");
const doctorController = require("./doctor.controller");

const router = Router();

router.get("/me", auth("DOCTOR"), doctorController.getDoctorProfile);

router.patch(
  "/me",
  auth("DOCTOR"),
  validateRequest(updateDoctorProfileSchema),
  doctorController.updateDoctorProfile
);

router.get(
  "/:id",
  validateRequest(doctorIdParamSchema, "params"),
  doctorController.getPublicDoctorDetails
);

module.exports = router;

