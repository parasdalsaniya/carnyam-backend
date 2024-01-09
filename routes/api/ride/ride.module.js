const router = require("express").Router();
const { error } = require("console");
const libFunction = require("../../../helpers/libFunction");
const rideDb = require("./ride.db");
var path = require("path");
const constants = require("../../../helpers/consts");
const libStorage = require("../../../helpers/libStorage");
const libAuth = require("../../../helpers/libAuth");
const crud = require("../../crud");
const rideFare = require("../../../helpers/rideFare");

function errorMessage(params) {
  return {
    status: false,
    error:
      params != undefined
        ? params
        : constants.requestMessages.ERR_SOMTHIN_WENT_WRONG,
  };
}

const getRideAmountModule = async (req) => {
  var vehicle = await rideDb.getRideAmountModule();
  return vehicle;
};

const getDailyRoutModule = async (req) => {
  var userId = req.user_id;

  var dailyRout = await rideDb.getDailyRout(userId);

  if (dailyRout.status == false) {
    return errorMessage();
  }

  if (dailyRout.data.length == 0) {
    return { status: true, data: [] };
  }

  var ridePoint = await rideFare.getRidePoint(
    dailyRout.data.map((x) => x.unique_id).join("','")
  );

  if (ridePoint.status == false || ridePoint.data.length == 0) {
    return errorMessage();
  }
  ridePoint.data.map((x) => {
    delete x["flag_deleted"];
    delete x["history_id"];
    delete x["change_log_id"];
    return x;
  });
  
  dailyRout = await Promise.all(
    dailyRout.data.map(async (x) => {
      return {
        ride_point: ridePoint.data.filter((y) => y.unique_id == x.unique_id),
        vehicle_subtype_id: x.vehicle_subtype_id,
        ride_date_time: await libFunction.formatDateTimeLib(x.ride_date_time),
        total_distance: x.total_distance,
        estimated_time: x.estimated_time,
        daily_rout_id: x.daily_rout_id,
        daily_rout_name:x.daily_rout_name
      };
    })
  );

  return { status: true, data: dailyRout };
};

const createDailyRoutModule = async (req) => {
  var distance = req.body.total_distance;
  var time = req.body.estimated_time;
  var rideTime = req.body.ride_date_time;
  var vehicleType = req.body.vehicle_subtype_id;
  var ridePoint = req.body.ride_point;
  var estimatedTime = req.body.estimated_time;
  var vehicleSubTypeId = req.body.vehicle_subtype_id;
  var rideDateTime = req.body.ride_date_time;
  var userId = req.user_id;
  var driverRoutName = req.body.daily_rout_name
  var validate = await libFunction.objValidator([
    distance,
    time,
    rideTime,
    vehicleType,
    estimatedTime,
    vehicleSubTypeId,
    rideDateTime,
    driverRoutName
  ]);

  if (validate == false) {
    return errorMessage(constants.requestMessages.ERR_INVALID_BODY);
  }

  if (ridePoint.length == 0) {
    return errorMessage(constants.requestMessages.ERR_INVALID_BODY);
  }

  if (
    ridePoint.filter((x) => x.flag_start_point == true).length == 0 ||
    ridePoint.filter((x) => x.flag_start_point == false).length == 0
  ) {
    return errorMessage(constants.requestMessages.ERR_INVALID_BODY);
  }

  const changeLogId = await libFunction.changeLogDetailsLib({
    ipAddress: req.ip,
    userId: userId,
  });
  var uniqueId = await libFunction.getUniqueId("daily_rout", null);
  var dailyRoutObj = [
    {
      field: "total_distance",
      value: distance,
    },
    {
      field: "estimated_time",
      value: time,
    },
    {
      field: "flag_deleted",
      value: false,
    },
    {
      field: "change_log_id",
      value: changeLogId,
    },
    {
      field: "vehicle_subtype_id",
      value: vehicleSubTypeId,
    },
    {
      field: "user_id",
      value: userId,
    },
    {
      field: "ride_date_time",
      value: rideDateTime,
    },
    {
      field: "unique_id",
      value: uniqueId,
    },
    {
      field:"daily_rout_name",
      value: driverRoutName
    }
  ];

  var dailyRout = await rideDb.createDailyRout(dailyRoutObj);

  if (dailyRout.status == false || dailyRout.data.length == 0) {
    return errorMessage();
  }
  await libFunction.updateUniqueId(uniqueId, dailyRout.data[0].daily_rout_id);
  ridePoint.map((x) => {
    x["unique_id"] = uniqueId;
    x["change_log_id"] = changeLogId;
    return x;
  });
  var ridePoint = await rideFare.createRidePoint(ridePoint);

  if (ridePoint.status == false || ridePoint.data.length == 0) {
    return errorMessage();
  }
  ridePoint = await getDailyRoutModule(req);

  return ridePoint;
};

const deleteDailyRoutModule = async (req) => {
  var userId = req.user_id;
  var dailyRoutId = req.query.daily_rout_id;

  if (dailyRoutId == undefined || dailyRoutId == null) {
    return errorMessage(constants.requestMessages.ERR_INVALID_BODY);
  }
  var changeLogId = await libFunction.changeLogDetailsLib({
    ipAddress: req.ip,
    userId: userId,
  });
  var deleteDailyRout = await rideDb.deleteDailyRout(
    dailyRoutId,
    changeLogId,
    userId
  );

  if (deleteDailyRout.status == false) {
    return errorMessage();
  }

  var ridePoint = await getDailyRoutModule(req);

  return ridePoint;
};

module.exports = {
  getRideAmountModule: getRideAmountModule,
  createDailyRoutModule: createDailyRoutModule,
  getDailyRoutModule: getDailyRoutModule,
  deleteDailyRoutModule: deleteDailyRoutModule,
};
