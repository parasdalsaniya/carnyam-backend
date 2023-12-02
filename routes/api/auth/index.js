const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { verifyToken } = require("../../middleware")
// const middleware = require("../../middleware");

router.get("/google-sign-up", authController.googleSignUpController);

router.post("/sign-up", verifyToken, authController.signUpWithPassword);

router.post("/sign-in", authController.signInWithPassword);

module.exports = router;
