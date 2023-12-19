const crud = require("../../crud");

const getVehicleDB = async () => {
  var sql = `select vehicle_id,vehicle_name,vehicle_seq,storage_id from vehicle where flag_deleted = false`;
  var result = await crud.executeQuery(sql);
  return result;
};

module.exports = {
  getVehicleDB: getVehicleDB,
};
