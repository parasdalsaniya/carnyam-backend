const crud = require("../routes/crud");

const calculateRideFare = (distanceInKM, perKMCost, timeInMin) => {
  return parseFloat(distanceInKM) * parseFloat(perKMCost);
};

const createRidePoint = async (ridePoint) => {
  var count = 0;
  var ridePointMap = ridePoint.map((x) => {
    count = count + 1;
    return `('${x.ride_point_name.replaceAll("'", "''")}','${x.latitude}','${
      x.longitude
    }','${x.flag_start_point}','false','${
      x.change_log_id
    }','${count}',ST_SetSRID(ST_MakePoint(${x.longitude}, ${
      x.latitude
    }), 4326),'${x.unique_id}')`;
  });
  var sql = `INSERT INTO ride_point
  (ride_point_name, latitude, longitude, flag_start_point, flag_deleted, change_log_id, ride_point_seq, geometry,unique_id)
  VALUES ${ridePointMap.join(",")} Returning *`;
  var result = await crud.executeQuery(sql);
  return result;
};

const getRidePoint = async (uniqueId) => {
  var result =
    await crud.executeQuery(`select * from ride_point where history_id is null and flag_deleted = false and unique_id in ('${uniqueId}')
    order by unique_id desc,flag_start_point desc,ride_point_seq asc`);
  return result;
};

const deleteDailyRout = async (dailyRoutId, changeLogId, userId) => {
  var result = await crud.executeQuery(
    `update daily_rout set flag_deleted = true,change_log_id = '${changeLogId}'  where daily_rout_id = '${dailyRoutId}' and user_id = '${userId}'`
  );
  return result;
};

const driverLiveLocation = async (location) => {
  await crud.executeQuery(`UPDATE driver_live_location
	SET  
  dll_ride_point_name='${location.ride_point_name.replaceAll("'", "''")}', 
  dll_latitude='${location.latitude}', dll_longitude='${location.longitude}', 
  geometry=ST_SetSRID(ST_MakePoint(${location.longitude}, ${
    location.latitude
  }), 4326),
  timestamp = '${location.timestamp}'
	WHERE driver_id='${location.driver_id}';`);
};

const createDriverLiveLocation = async (driverId, timestamp) => {
  await crud.executeQuery(`INSERT INTO public.driver_live_location(
  driver_id, dll_ride_point_name, dll_latitude, dll_longitude, geometry, "timestamp")
  VALUES ('${driverId}', 'Ahmedabad', '23.022505', '72.571365', ST_SetSRID(ST_MakePoint(72.571365, 23.022505), 4326),'${timestamp}');`);
};

module.exports = {
  calculateRideFare,
  createRidePoint,
  getRidePoint,
  deleteDailyRout,
  driverLiveLocation,
  createDriverLiveLocation,
};
