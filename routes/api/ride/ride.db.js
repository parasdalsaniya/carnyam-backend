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

const getRideDetailByRideId = async (rideId) => {
  var result = await crud.executeQuery(`select * from ride
  JOIN ride_detail
  on ride.ride_id = ride_detail.ride_id
  left JOIN driver
  on driver.driver_id = ride.driver_id and driver.history_id is null and driver.flag_deleted = false
  left JOIN public.user
  on public.user.user_id = ride.user_id and public.user.history_id is null and public.user.flag_deleted = false
  where ride.flag_deleted = false and ride.history_id is null
  and ride_detail.flag_deleted = false and ride_detail.history_id is null and ride.ride_id
  in ('${rideId}')`)
  return result
}

const deleteRideById = async(rideId,changeLogId) => {
  var result = await crud.executeQuery(`update ride set change_log_id = '${changeLogId}' ,flag_deleted = true where ride_id = '${rideId}'`)
  return result
}

const getRideDetail = async(rideId) => {
  var result = await crud.executeQuery(`select * from ride where history_id is null and flag_deleted = false and ride_id in ('${rideId}')`)
  return result
} 

module.exports = {
  getVehicleDB: getVehicleDB,
  createDailyRout: createDailyRout,
  getDailyRout: getDailyRout,
  updateDailyRout: updateDailyRout,
  deleteDailyRout: deleteDailyRout,
  createRideDB:createRideDB,
  creaetRideDetailDB:creaetRideDetailDB,
  getRideDetailByRideId:getRideDetailByRideId,
  deleteRideById:deleteRideById,
  getRideDetail:getRideDetail
};
