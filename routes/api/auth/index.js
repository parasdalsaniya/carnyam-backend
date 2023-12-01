const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
// const middleware = require("../../middleware");

router.get("/google-sign-up", authController.googleSignUpController);

module.exports = router;
