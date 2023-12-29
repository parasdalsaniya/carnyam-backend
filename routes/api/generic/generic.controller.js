const genericModule = require("./generic.module");

const getVehicleController = async (req, res) => {
  const result = await genericModule.getVehicleModule(req);
  return res.send(result);
};

const getRideFareController = async (req, res) => {
  const result = await genericModule.getRideFareModule(req);
  return res.send(result);
};

module.exports = {
  getVehicleController: getVehicleController,
  getRideFareController
};
