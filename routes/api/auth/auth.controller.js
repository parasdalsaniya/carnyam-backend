const authModule = require("./auth.module");

const { errors } = require("../../../helpers/consts");
const libFunction = require("../../../helpers/libFunction");

const googleSignUpController = async (req, res) => {
  console.log("AuthForgotContoller");
  const result = await authModule.googleSignUpModule(req);
  return res.send(result);
};

const signUpWithPassword = async (req, res) => {
  const result = await authModule.signUpWithPasswordModule(req);
  if (result.status == true) {
    res.setHeader(
      "Set-Cookie",
      `cn-ssid=${result.data.accessToken}; Domain=${process.env.COOKIE_DOMAIN};Secure;Path=/;HttpOnly;SameSite=None;`
    );
    res.send(result);
  } else {
    return res.send(result);
  }
};

const signInWithPassword = async (req, res) => {
  const result = await authModule.signInWithPasswordModule(req, res);
  return res.send(result);
};

const googleCallBackController = async (req, res) => {
  const result = await authModule.googleCallBackModule(req);
  return res.send(result);
};

const creaetInsertQueryController = async (req, res) => {
  const result = await authModule.creaetInsertQueryModule(req);
  return res.send(result);
};

module.exports = {
  googleSignUpController,
  signUpWithPassword,
  signInWithPassword,
  googleCallBackController,
  creaetInsertQueryController,
};
