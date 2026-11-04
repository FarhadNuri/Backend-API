const { Router } = require("express");
const { status } = require("http-status");
const { sendResponse } = require("../utils/sendResponse");
const authRouter = require("../modules/auth/auth.route");
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


router.use("/auth", authRouter);

// 2. router.use("/users", userRouter);
// 3. router.use("/doctors/me/chambers", chamberRouter); 
// 4. router.use("/doctors", doctorRouter);
// 5. router.use("/search", searchRouter);

router.use(diseaseRouter);

// 7. router.use("/admin", adminRouter);


module.exports = router;

