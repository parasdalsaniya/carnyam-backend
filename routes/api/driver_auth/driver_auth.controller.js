const driverAuthModule = require("./driver_auth.module");

const createDriverProfileController = async (req, res) => {
  const result = await driverAuthModule.createDriverProfileModule(req);
  return res.send(result);
};

const updateDriverProfileController = async (req, res) => {
  const result = await driverAuthModule.updateDriverProfileModule(req);
  return res.send(result);
};

const getDriverProfileController = async (req, res) => {
  const result = await driverAuthModule.getDriverProfileModule(req);
  return res.send(result);
};

const sendOtpDriverController = async (req, res) => {
  const result = await driverAuthModule.sendOtpDriverModule(req);
  return res.send(result);
};

const loginOtpDriverController = async (req, res) => {
  const result = await driverAuthModule.loginOtpDriverModule(req);
  return res.send(result);
};

module.exports = {
  createDriverProfileController: createDriverProfileController,
  updateDriverProfileController: updateDriverProfileController,
  getDriverProfileController: getDriverProfileController,
  sendOtpDriverController: sendOtpDriverController,
  loginOtpDriverController: loginOtpDriverController,
};
