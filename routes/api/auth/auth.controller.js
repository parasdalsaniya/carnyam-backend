const router = require("express").Router();
const authModule = require("./auth.module");
var http = require("http");
const req = require("express/lib/request");
const res = require("express/lib/response");

const googleSignUpController = async (req, res) => {
  console.log("AuthForgotContoller");
  const result = await authModule.googleSignUpModule(req);
  return res.send(result);
};

module.exports = {
  googleSignUpController: googleSignUpController,
};
