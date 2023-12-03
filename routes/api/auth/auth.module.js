const router = require("express").Router();
const libFunction = require("../../../helpers/libFunction");
const authDb = require("./auth.db");

const googleSignUpModule = async (req) => {
  await authDb.test();
  var clientID =
    "614551831041-a2hp72soet4876la551uniqi06rju0e5.apps.googleusercontent.com"; //Database
  var redirectUri;
  console.log(process.env.FILEMASTER_TESTMODE);
  if (process.env.FILEMASTER_TESTMODE == "false") {
    redirectUri = "https://api.filemaster.io/api/auth/google/callback";
  } else {
    redirectUri = "https://api.filemaster.io/api/auth/google/callback";
  }
  var googleloginUrl = "https://accounts.google.com/o/oauth2/auth"; //Database
  var code = null;
  var string = await libFunction.makeid(32);
  var timestamp = await libFunction.formatDateTimeLib(new Date());
  var googleUrl = `${googleloginUrl}?redirect_uri=${redirectUri}&response_type=code&client_id=${clientID}&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+openid&access_type=offline&state=${string}`;
  console.log("dhaval");
  return { status: true, url: googleUrl };
};

const signUpWithPasswordModule = async () => {
  try {
    console.log("signUpWithPasswordModule");
  } catch (error) {
    throw error;
  }
};

const signInWithPasswordModule = async () => {
  try {
    console.log("signInWithPasswordModule");
  } catch (error) {
    throw error;
  }
};

const verifyOTPModule = async () => {
  try {
    console.log("verify OTP");
  } catch (error) {
    throw error;
  }
};

module.exports = {
  googleSignUpModule,
  signUpWithPasswordModule,
  signInWithPasswordModule,
  verifyOTPModule,
};
