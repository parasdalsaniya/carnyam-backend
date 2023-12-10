const express = require("express");
const router = express.Router();
const userController = require("./users.controller.js");
const { verifyToken } = require("../../middleware");
// const middleware = require("../../middleware");

router.get("/me", userController.getUserDetailController);

module.exports = router;
