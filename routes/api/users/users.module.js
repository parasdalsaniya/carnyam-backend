const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const libFunction = require("../../../helpers/libFunction");
const userDb = require("./users.db");
var syncRequest = require("sync-request");
var constant = require("../../../helpers/consts");
var path = require("path");

const getUserDetailModule = async (req) => {
  var userId = req.user_id;
  var userDetail = await userDb.getUserDetailbyUserId(userId);

  if (userDetail.status == false || userDetail.data.length == 0) {
    return {
      status: false,
      error: "User Not Found",
    };
  }

//   var result = {
//     status: true,
//     data: {
//         "user_name":
//     },
//   };
};

module.exports = {
  getUserDetailModule,
};
