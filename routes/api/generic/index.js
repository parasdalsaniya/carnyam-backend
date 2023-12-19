const express = require("express");
const router = express.Router();
const genericController = require("./generic.controller.js");
const { verifyToken } = require("../../middleware");
const middleware = require("../../middleware");

router.get("/vehicle", genericController.getVehicleController);

module.exports = router;
