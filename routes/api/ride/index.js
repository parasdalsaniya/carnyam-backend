const express = require("express");
const router = express.Router();
const rideController = require("./ride.controller.js");
const { verifyToken } = require("../../middleware.js");
const middleware = require("../../middleware.js");

router.get("/", rideController.getRideAmountController);
router.post(
  "/daily-rout",
  middleware.checkAccessToken,
  rideController.createDailyRoutCountroller
);

router.get(
  "/daily-rout",
  middleware.checkAccessToken,
  rideController.getDailyRoutCountroller
);

router.delete(
  "/daily-rout",
  middleware.checkAccessToken,
  rideController.deleteDailyRoutController
);

router.post("/create-ride",middleware.checkAccessToken,rideController.createRideController)
router.get("/get-ride",middleware.checkAccessToken,rideController.getRideController)
router.delete("/cancle-ride",middleware.checkAccessToken,rideController.cancleRideController)

router.delete("/delete-ride",middleware.checkAccessToken,rideController.cancleRideController)
router.post("/book-ride",middleware.checkAccessToken,rideController.bookRideController)
router.post("/ride-otp",middleware.checkAccessToken,rideController.rideOtpController)
module.exports = router;
