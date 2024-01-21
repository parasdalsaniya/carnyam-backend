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

const createRideController = async(req,res) => {
  const result = await rideModule.createRideModule(req);
  return res.send(result);
}

const getRideController = async(req,res) => {
  const result = await rideModule.getRideModule(req)
  return res.send(result)
}

const cancleRideController = async(req,res) => {
  const result = await rideModule.cancleRideModule(req)
  return res.send(result)
}

module.exports = {
  getRideAmountController: getRideAmountController,
  createDailyRoutCountroller: createDailyRoutCountroller,
  getDailyRoutCountroller: getDailyRoutCountroller,
  deleteDailyRoutController: deleteDailyRoutController,
  createRideController:createRideController,
  getRideController:getRideController,
  cancleRideController:cancleRideController
};
