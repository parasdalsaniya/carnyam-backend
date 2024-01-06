const rideModule = require("./ride.module");

const getRideAmountController = async (req, res) => {
  const result = await rideModule.getRideAmountModule(req);
  return res.send(result);
};

const createDailyRoutCountroller = async (req, res) => {
  const result = await rideModule.createDailyRoutModule(req);
  return res.send(result);
};

const getDailyRoutCountroller = async (req, res) => {
  const result = await rideModule.getDailyRoutModule(req);
  return res.send(result);
};

const deleteDailyRoutController = async (req, res) => {
  const result = await rideModule.deleteDailyRoutModule(req);
  return res.send(result);
};

module.exports = {
  getRideAmountController: getRideAmountController,
  createDailyRoutCountroller: createDailyRoutCountroller,
  getDailyRoutCountroller: getDailyRoutCountroller,
  deleteDailyRoutController: deleteDailyRoutController,
};
