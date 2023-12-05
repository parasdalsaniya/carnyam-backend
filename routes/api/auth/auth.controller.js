const {
  signUpWithPasswordModule,
  signInWithPasswordModule,
  verifyOTPModule,
} = require("./auth.module");
const { errors } = require("../../../helpers/consts");

const googleSignUpController = async (req, res) => {
  console.log("AuthForgotContoller");
  const result = await authModule.googleSignUpModule(req);
  return res.send(result);
};

const signUpWithPassword = async (req, res) => {
  try {
    const newUser = await signUpWithPasswordModule(req);
    return res.status(200).json({
      status: true,
      message: "Sign up successful",
      data: newUser,
    });
  } catch (error) {
    console.log("SignUp Error: ", error);
    return res.status(error.statusCode || 500).json({
      status: error.status || false,
      message: error.message || errors.INTERNAL_SERVER_ERROR,
    });
  }
};

const signInWithPassword = async (req, res) => {
  try {
    const newUser = await signInWithPasswordModule(req, res);
    return res.status(201).json({
      status: true,
      message: "Sign In successful",
      data: newUser,
    });
  } catch (error) {
    console.log("Sign In Error: ", error);
    return res.status(error.statusCode || 500).json({
      status: error.status || false,
      message: error.message || errors.INTERNAL_SERVER_ERROR,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const newUser = await verifyOTPModule(req.body);
    return res.status(201).json({
      status: true,
      message: "Sign up successful",
      data: newUser,
    });
  } catch (error) {
    console.log("SignUp Error: ", error);
    return res.status(error.statusCode || 500).json({
      status: error.status || false,
      message: error || errors.INTERNAL_SERVER_ERROR,
    });
  }
};

module.exports = {
  googleSignUpController,
  signUpWithPassword,
  signInWithPassword,
  verifyOTP,
};
