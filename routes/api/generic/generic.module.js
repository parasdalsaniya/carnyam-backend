const router = require("express").Router();
const { error } = require("console");
const libFunction = require("../../../helpers/libFunction");
const genericDb = require("./generic.db");
var path = require("path");
const constants = require("../../../helpers/consts");
const libStorage = require("../../../helpers/libStorage");
const libAuth = require("../../../helpers/libAuth");
const crud = require("../../crud");

const getVehicleModule = async (req) => {
  var vehicle = await genericDb.getVehicleDB();
  return vehicle;
};

module.exports = {
  getVehicleModule: getVehicleModule,
};
