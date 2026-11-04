const { Router } = require("express");
const { authRateLimiter } = require("../../middlewares/rateLimiter");
const { validateRequest } = require("../../middlewares/validateRequest");
const {
  registerUserSchema,
  registerDoctorSchema,
  loginSchema,
} = require("./auth.validation");
const authController = require("./auth.controller");

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validateRequest(registerUserSchema),
  authController.registerUser
);

router.post(
  "/register/doctor",
  authRateLimiter,
  validateRequest(registerDoctorSchema),
  authController.registerDoctor
);

router.post(
  "/login",
  authRateLimiter,
  validateRequest(loginSchema),
  authController.login
);

module.exports = router;

