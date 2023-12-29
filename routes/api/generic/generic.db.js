const crud = require("../../crud");

const getVehicleDB = async (vehicleSubtypeId) => {
  let sql = `
    SELECT
      vt.vehicle_type_id,
      vt.vehicle_type_name,
      vs.vehicle_subtype_id,
      vs.vehicle_subtype_name,
      vs.vehicle_subtype_price_per_km,
      vs.vehicle_subtype_num_of_seats
    FROM
      vehicle_type vt
    LEFT JOIN
      vehicle_subtype vs ON vt.vehicle_type_id = vs.vehicle_type_id
  `;

  if (vehicleSubtypeId)
    sql += ` WHERE vs.vehicle_subtype_id = '${vehicleSubtypeId}' `;

  sql += ` ORDER BY vt.vehicle_type_id, vs.vehicle_subtype_id; `;

  const result = await crud.executeQuery(sql);
  return result;
};

module.exports = {
  getVehicleDB: getVehicleDB,
};
