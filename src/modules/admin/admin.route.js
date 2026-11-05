const { Router } = require("express");
const { auth } = require("../../middlewares/auth");
const { validateRequest } = require("../../middlewares/validateRequest");
const adminController = require("./admin.controller");
const {
  listDoctorsQuerySchema,
  doctorIdParamSchema,
  addDoctorSchema,
} = require("./admin.validation");

const router = Router();

router.use(auth("ADMIN"));

router.get(
  "/doctors",
  validateRequest(listDoctorsQuerySchema, "query"),
  adminController.listDoctors
);

router.patch(
  "/doctors/:id/approve",
  validateRequest(doctorIdParamSchema, "params"),
  adminController.approveDoctor
);

router.patch(
  "/doctors/:id/reject",
  validateRequest(doctorIdParamSchema, "params"),
  adminController.rejectDoctor
);

router.post(
  "/doctors",
  validateRequest(addDoctorSchema, "body"),
  adminController.addDoctor
);

module.exports = router;

