const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); 
const libFunction = require("../../../helpers/libFunction");
const { sendOTP } = require("../../../helpers/sendOTP");
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

const signUpWithPasswordModule = async (req, res) => {
  try {
    const { name, email, password, mobile, gender, profileImage } = req.body

    const userByEmail = await authDb.getUser({ user_mobile_number: mobile });
    if (userByEmail.data.length)
      throw new Error("User is already register with mobile number.")

    const userByMobile = await authDb.getUser({ user_email: email })
    if (userByMobile.data.length)
      throw new Error("User is already register with email.")

    const timestamp = await libFunction.formatDateTimeLib(new Date());
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await authDb.createUser({ name, email, password: hashedPassword, mobile, gender, profileImage, timestamp });
    if (result.status === false)
      throw new Error("user not creted")

    const otp = sendOTP()
    const updateUser = await authDb.updateUser({ email, mobile }, { otp_auth_id: otp })

    return result.data[0]
  } catch (error) {
    throw error;
  }
};

const signInWithPasswordModule = async (req) => {
  try {
    const { email, password } = req.body;

    const user = await authDb.getUser({ user_email: email });
    if (!user.data.length)
      throw new Error("User not found")

    const isValidPassword = await bcrypt.compareSync(password, user.data[0].user_password);
    if (!isValidPassword)
      throw new Error("Invalid cradentils.")
    const jwtToken = jwt.sign(
      user,
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return { ...user.data[0], token: jwtToken }
  } catch (error) {
    console.log('error', error)
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
