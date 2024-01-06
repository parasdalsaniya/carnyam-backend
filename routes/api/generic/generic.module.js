const router = require("express").Router();
const { error } = require("console");
const libFunction = require("../../../helpers/libFunction");
const genericDb = require("./generic.db");
var path = require("path");
const constants = require("../../../helpers/consts");
const libStorage = require("../../../helpers/libStorage");
const libAuth = require("../../../helpers/libAuth");
const crud = require("../../crud");
const { calculateRideFare } = require("../../../helpers/rideFare");

const getVehicleModule = async (req) => {
  var vehicle = await genericDb.getVehicleDB();
  return vehicle;
};

const getRideFareModule = async (req) => {
  try {
    console.log(req.body);
    const { vehicle_sub_type, total_distance, estimated_time } = req.body;

    const vehicleDetail = await genericDb.getVehicleDB(+vehicle_sub_type);
    const cost = calculateRideFare(
      total_distance,
      vehicleDetail.data[0].vehicle_subtype_price_per_km,
      estimated_time
    );

    return { totalRideFare: cost };
  } catch (error) {
    console.log("Error in getRideFareModule: ", error);
  }
};

module.exports = {
  getVehicleModule: getVehicleModule,
  getRideFareModule: getRideFareModule,
};
