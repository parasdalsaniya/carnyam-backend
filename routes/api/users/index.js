const express = require("express");
const router = express.Router();
const userController = require("./users.controller.js");
const { verifyToken } = require("../../middleware");
const middleware = require("../../middleware");

router.get(
  "/me",
  middleware.checkAccessToken,
  userController.getUserDetailController
);

router.post(
  "/send-otp-login",
  middleware.checkAccessToken,
  userController.sendOtpForLoginController
);

router.post(
  "/verify-otp-login",
  middleware.checkAccessToken,
  userController.verifyOtpForLoginController
);

module.exports = router;
