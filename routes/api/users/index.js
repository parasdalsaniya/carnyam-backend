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

router.post("/send-otp-login", userController.sendOtpForLoginController);

router.post("/verify-otp-login", userController.verifyOtpForLoginController);

router.put(
  "/update-user-detail",
  middleware.checkAccessToken,
  userController.updateUserController
);

router.get("/district", userController.getDistrictController);

router.get("/city", userController.getCityController);

router.get("/delete-user",userController.deleteUserController)

module.exports = router;
