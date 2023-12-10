const userModule = require("./users.module");

const getUserDetailController = async (req, res) => {
  const result = await userModule.getUserDetailModule(req);
  return res.send(result);
};

const sendOtpForLoginController = async (req, res) => {
  const result = await userModule.sendOtpForLoginModule(req);
  return res.send(result);
};

const verifyOtpForLoginController = async (req, res) => {
  const result = await userModule.verifyOtpForLoginModule(req);
  return res.send(result);
};

const updateUserController = async (req, res) => {
  const result = await userModule.updateUserModule(req);
  return res.send(result);
};

const getDistrictController = async (req, res) => {
  const result = await userModule.getDistrictModule(req);
  return res.send(result);
};

const getCityController = async (req, res) => {
  const result = await userModule.getCityModule(req);
  return res.send(result);
};

module.exports = {
  getUserDetailController: getUserDetailController,
  sendOtpForLoginController: sendOtpForLoginController,
  verifyOtpForLoginController: verifyOtpForLoginController,
  updateUserController: updateUserController,
  getDistrictController: getDistrictController,
  getCityController: getCityController,
};
