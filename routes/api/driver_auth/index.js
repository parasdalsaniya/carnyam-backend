const express = require("express");
const router = express.Router();
const driverAuthController = require("./driver_auth.controller.js");
const { verifyToken } = require("../../middleware");
const middleware = require("../../middleware");

router.post("/", driverAuthController.createDriverProfileController);
router.put("/", driverAuthController.updateDriverProfileController);
router.get(
  "/",
  middleware.checkAccessToken,
  driverAuthController.getDriverProfileController
);

router.post("/send-otp", driverAuthController.sendOtpDriverController);

router.post("/login", driverAuthController.loginOtpDriverController);

module.exports = router;
