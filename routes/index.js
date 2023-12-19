var express = require("express");
var router = express.Router();
require("dotenv").config();
var constant = require("../helpers/consts");

/* GET home page. */
router.use("/api/auth", require("./api/auth"));
router.use("/api/users", require("./api/users"));
router.use("/api/storage", require("./api/storage"));
router.use("/api/driver-auth", require("./api/driver_auth"));
router.use("/api/generic", require("./api/generic"));

router.use("**", (req, res) => {
  return res.send({
    status: false,
    error: constant.requestMessages.ERR_INVALID_API_REQUEST,
  });
});

module.exports = router;
