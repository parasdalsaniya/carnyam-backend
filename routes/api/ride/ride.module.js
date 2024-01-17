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
const rideFareModule = require("../generic/generic.module");
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
        daily_rout_name: x.daily_rout_name,
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
  var driverRoutName = req.body.daily_rout_name;
  var validate = await libFunction.objValidator([
    distance,
    time,
    rideTime,
    vehicleType,
    estimatedTime,
    vehicleSubTypeId,
    rideDateTime,
    driverRoutName,
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
      field: "daily_rout_name",
      value: driverRoutName,
    },
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

const createRideModule = async (req) => {
  var userId = req.body.user_id;
  var distance = req.body.total_distance;
  var time = req.body.estimated_time;
  var rideTime = req.body.ride_date_time;
  var vehicleType = req.body.vehicle_subtype_id;
  var ridePoint = req.body.ride_point;
  var estimatedTime = req.body.estimated_time;
  var vehicleSubTypeId = req.body.vehicle_subtype_id;
  var rideDateTime = req.body.ride_date_time;
  var userId = req.user_id;
  // var driverRoutName = req.body.daily_rout_name
  var paymentType = req.body.payment_type;
  var validate = await libFunction.objValidator([
    distance,
    time,
    rideTime,
    // vehicleType,
    estimatedTime,
    vehicleSubTypeId,
    rideDateTime,
    // driverRoutName,
    paymentType,
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
  const uniqueId = await libFunction.getUniqueId("ride", null);

  var rideObj = [
    { field: "user_id", value: userId },
    { field: "driver_id", value: null },
    { field: "change_log_id", value: changeLogId },
    { field: "flag_change_by", value: true },
    { field: "flag_ride_end", value: false },
    { field: "unique_id", value: uniqueId },
    { field: "flag_deleted", value: uniqueId },
  ];

  var createRide = await rideDb.createRideDB(rideObj);

  if (createRide.status == false || createRide.data.length == 0) {
    return errorMessage(constants.requestMessages.ERR_SOMTHIN_WENT_WRONG);
  }

  var rideId = createRide.data[0].ride_id;
  var rideAmmoutObj = {"body": {
    vehicle_sub_type: vehicleSubTypeId,
    total_distance: distance,
    estimated_time: estimatedTime,
  }};
  const rideAmmout = await rideFareModule.getRideFareModule(rideAmmoutObj);
  var rideDetail = [
    { field: "ride_id", value: rideId },
    { field: "vehicle_subtype_id", value: vehicleSubTypeId },
    { field: "payment_type", value: paymentType },
    { field: "payment_amount", value: rideAmmout.totalRideFare },
    {
      field: "ride_date_time",
      value: await libFunction.formatDateTimeLib(new Date(rideDateTime)),
    },
    { field: "total_distance", value: distance },
    { field: "estimated_time", value: estimatedTime },
    { field: "flag_deleted", value: false },
    { field: "history_id", value: null },
    { field: "change_log_id", value: changeLogId },
    { field: "flag_change_by", value: true },
  ];
  
  var creaetRideDetail = await rideDb.creaetRideDetailDB(rideDetail);

  if (creaetRideDetail.status == false || creaetRideDetail.data.length == 0) {
    return errorMessage(constants.requestMessages.ERR_SOMTHIN_WENT_WRONG);
  }

  ridePoint.map((x) => {
    x["unique_id"] = uniqueId;
    x["change_log_id"] = changeLogId;
    return x;
  });
  var ridePoint = await rideFare.createRidePoint(ridePoint);

  if (ridePoint.status == false || ridePoint.data.length == 0) {
    return errorMessage();
  }
  await libFunction.updateUniqueId(uniqueId,createRide.data[0].ride_id);
  const rideModule = await getRideModuke(req)
  return rideModule;
};

const getRideModuke = async(req) => {
  var rideId = req.query.ride_id
  var userId = req.user_id

  if(rideId == undefined || rideId == null || rideId == undefined){
    return errorMessage(constants.requestMessages.ERR_INVALID_BODY)
  }

  var rideDetail = await rideDb.getRideDetailByRideId(rideId)

  if(rideDetail.status == false || rideDetail.data.length == 0){
    return errorMessage()
  }

  if(rideDetail.data[0].user_id != userId){
    return errorMessage("Error invalid authentication found")
  }

  delete rideDetail.data[0].history_id
  delete rideDetail.data[0].change_log_id
  delete rideDetail.data[0].flag_deleted
  delete rideDetail.data[0].driver_email
  delete rideDetail.data[0].driver_address
  delete rideDetail.data[0].city_id
  delete rideDetail.data[0].vehicle_id
  delete rideDetail.data[0].timestamp
  delete rideDetail.data[0].refrence_id
  delete rideDetail.data[0].flag_verified
  delete rideDetail.data[0].driver_profile_id
  delete rideDetail.data[0].user_email
  delete rideDetail.data[0].user_password
  delete rideDetail.data[0].oauth_id
  delete rideDetail.data[0].flag_email_verified
  delete rideDetail.data[0].flag_mobile_verified
  var ridePoint = await rideFare.getRidePoint(rideDetail.data[0].unique_id)

  if(ridePoint.status == false || ridePoint.data.length == 0){
    return errorMessage()
  }

  rideDetail.data[0]["ride_point"] = ridePoint.data.map( x => {
    delete x.flag_deleted
    delete x.history_id
    delete x.change_log_id
    return x
  })

  return rideDetail
}

module.exports = {
  getRideAmountModule: getRideAmountModule,
  createDailyRoutModule: createDailyRoutModule,
  getDailyRoutModule: getDailyRoutModule,
  deleteDailyRoutModule: deleteDailyRoutModule,
  createRideModule: createRideModule,
  getRideModuke:getRideModuke
};
