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

module.exports = {
  getVehicleDB: getVehicleDB,
  createDailyRout: createDailyRout,
  getDailyRout: getDailyRout,
  updateDailyRout: updateDailyRout,
};
