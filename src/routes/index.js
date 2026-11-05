const { Router } = require("express");
const { status } = require("http-status");
const { sendResponse } = require("../utils/sendResponse");
const authRouter = require("../modules/auth/auth.route");
const userRouter = require("../modules/user/user.route");
const chamberRouter = require("../modules/chamber/chamber.route");
const doctorRouter = require("../modules/doctor/doctor.route");
const diseaseRouter = require("../modules/disease/disease.route");

const router = Router();

router.get("/health", (_req, res) => {
  sendResponse(res, {
    statusCode: status.OK,
    message: "Server is healthy",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});


// 1. /auth
router.use("/auth", authRouter);

// 2. /users
router.use("/users", userRouter);

// 3. /doctors/me/chambers
router.use("/doctors/me/chambers", chamberRouter);

// 4. /doctors
router.use("/doctors", doctorRouter);

// 5. router.use("/search", searchRouter);

// 6. /diseases and /specialties
router.use(diseaseRouter);

// 7. router.use("/admin", adminRouter);

module.exports = router;
