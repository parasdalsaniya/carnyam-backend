const crud = require("../../crud");

const getVehicleDB = async () => {
  var sql = `select vehicle_id,vehicle_name,vehicle_seq,storage_id from vehicle where flag_deleted = false`;
  var result = await crud.executeQuery(sql);
  return result;
};

const createDailyRout = async (dailyRout) => {
  var result = await crud.makeInsertQueryString("daily_rout", dailyRout, true);
  return result;
};

const getDailyRout = async (userId) => {
  var sql = `select * from daily_rout where history_id is null and flag_deleted = false and user_id = '${userId}' 
  order by daily_rout_id`;
  var result = await crud.executeQuery(sql);
  return result;
};

const updateDailyRout = async (dailyRoutObj) => {
  var sql = ``;
  var result = await crud.executeQuery(sql);
  return result;
};

const deleteDailyRout = async (dailyRoutId, changeLogId, userId) => {
  var result = await crud.executeQuery(
    `update daily_rout set flag_deleted = true,change_log_id = '${changeLogId}'  where daily_rout_id = '${dailyRoutId}' and user_id = '${userId}'`
  );
  return result;
};

const createRideDB = async(ride) => {
  var result = await crud.makeInsertQueryString("ride",ride,true)
  return result
}

const creaetRideDetailDB = async (rideDetail) => {
  var result = await crud.makeInsertQueryString("ride_detail",rideDetail,true)
  return result
}

module.exports = {
  getVehicleDB: getVehicleDB,
  createDailyRout: createDailyRout,
  getDailyRout: getDailyRout,
  updateDailyRout: updateDailyRout,
  deleteDailyRout: deleteDailyRout,
  createRideDB:createRideDB,
  creaetRideDetailDB:creaetRideDetailDB
};
