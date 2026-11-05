const { Router } = require("express");
const { status } = require("http-status");
const { sendResponse } = require("../utils/sendResponse");
const authRouter = require("../modules/auth/auth.route");
const userRouter = require("../modules/user/user.route");
const chamberRouter = require("../modules/chamber/chamber.route");
const doctorRouter = require("../modules/doctor/doctor.route");
const searchRouter = require("../modules/search/search.route");
const diseaseRouter = require("../modules/disease/disease.route");
const adminRouter = require("../modules/admin/admin.route");

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

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/doctors/me/chambers", chamberRouter);
router.use("/doctors", doctorRouter);
router.use("/search", searchRouter);
router.use(diseaseRouter);
router.use("/admin", adminRouter);


module.exports = router;
