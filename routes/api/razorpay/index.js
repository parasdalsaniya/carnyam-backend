const express = require("express");
const router = express.Router();
const middleware = require("../../middleware.js")
const { orderController, paymentCaptureController } = require("./razorpay.controller.js");

// router.get(
//   "/me",
//   middleware.checkAccessToken,
//   userController.getUserDetailController
// );

router.post("/order", orderController)

router.post('/paymentCapture', middleware.checkAccessToken, paymentCaptureController)

module.exports = router;
