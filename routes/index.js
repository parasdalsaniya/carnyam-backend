var express = require("express");
var router = express.Router();
require("dotenv").config();

/* GET home page. */
router.use("/api/auth", require("./api/auth"));

router.use("**", (req, res) => {
  return res.send({
    status: false,
    error: constant.requestMessages.ERR_INVALID_API_REQUEST,
  });
});

module.exports = router;
