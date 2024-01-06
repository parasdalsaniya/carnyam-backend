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
module.exports = router;
