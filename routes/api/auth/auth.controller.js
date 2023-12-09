const authModule = require("./auth.module");

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

const googleCallBackController = async (req, res) => {
  const result = await authModule.googleCallBackModule(req);
  return res.send(result);
}


module.exports = {
  googleSignUpController,
  signUpWithPassword,
  signInWithPassword,
  googleCallBackController,

};
