const crud = require("../routes/crud");

const calculateRideFare = (distanceInKM, perKMCost, timeInMin) => {
  const cost = parseFloat(distanceInKM) * parseFloat(perKMCost)
  return cost.toFixed(2);
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

const updateDriverLiveLocation = async (location) => {
  await crud.executeQuery(`UPDATE driver_live_location
	SET  
  dll_ride_point_name='${location.ride_point_name.replaceAll("'", "''")}', 
  dll_latitude='${location.latitude}', dll_longitude='${location.longitude}', 
  geometry=ST_SetSRID(ST_MakePoint(${location.longitude}, ${
    location.latitude
  }), 4326),
  timestamp = '${location.timestamp}',
  socket_id = '${location.socket_id}'
	WHERE driver_id='${location.driver_id}'`);
};

const createDriverLiveLocation = async (driverId, timestamp) => {
  await crud.executeQuery(`INSERT INTO public.driver_live_location(
  driver_id, dll_ride_point_name, dll_latitude, dll_longitude, geometry, "timestamp",socket_id,flag_ride_on)
  VALUES ('${driverId}', 'Ahmedabad', '23.022505', '72.571365', ST_SetSRID(ST_MakePoint(72.571365, 23.022505), 4326),'${timestamp}','622003',false);`);
};

const getNearestDriver = async (latitude, longitude, radius) => {
  var sql = `SELECT 
      *,
      ST_Distance(geometry::geography, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography) / 1000 AS distance_km,
      ST_Distance(geometry::geography, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography) AS distance_mit
    FROM 
      driver_live_location
    WHERE 
    ST_DWithin(geometry::geography, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, ${radius}) -- 5000 meters = 5 km
      ORDER BY distance_km;`;
  var result = await crud.executeQuery(sql);
  return result;
};

const updateUserLiveLocation = async (location) => {
  await crud.executeQuery(`UPDATE user_live_location
	SET  
  ull_ride_point_name='${location.ride_point_name.replaceAll("'", "''")}', 
  ull_latitude='${location.latitude}', dll_longitude='${location.longitude}', 
  geometry=ST_SetSRID(ST_MakePoint(${location.longitude}, ${
    location.latitude
  }), 4326),
  timestamp = '${location.timestamp}',
  socket_id = '${location.socket_id}'
	WHERE user_id='${location.user_id}'`);
};

const createUserLiveLocation = async (userId, timestamp) => {
  await crud.executeQuery(`INSERT INTO public.user_live_location(
  user_id, ull_ride_point_name, ull_latitude, ull_longitude, geometry, "timestamp",socket_id,flag_ride_on)
  VALUES ('${userId}', 'Ahmedabad', '23.022505', '72.571365', ST_SetSRID(ST_MakePoint(72.571365, 23.022505), 4326),'${timestamp}','622003',false);`);
};

module.exports = {
  calculateRideFare: calculateRideFare,
  createRidePoint: createRidePoint,
  getRidePoint: getRidePoint,
  updateDriverLiveLocation: updateDriverLiveLocation,
  createDriverLiveLocation: createDriverLiveLocation,
  getNearestDriver: getNearestDriver,
  updateUserLiveLocation:updateUserLiveLocation,
  createUserLiveLocation:createUserLiveLocation
};
