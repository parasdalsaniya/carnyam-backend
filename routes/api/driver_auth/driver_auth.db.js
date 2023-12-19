const crud = require("../../crud");

const createDriverProfile = async (
  driverName,
  driverMobile,
  driverEmail,
  driverAddress,
  refreshId,
  cityId,
  vehicleId,
  timestamp
) => {
  let fieldArr = [
    { field: "driver_name", value: driverName },
    { field: "driver_mobile_number", value: driverMobile },
    { field: "driver_email", value: driverEmail },
    { field: "driver_address", value: driverAddress },
    { field: "city_id", value: cityId },
    { field: "vehicle_id", value: vehicleId },
    { field: "history_id", value: null },
    { field: "flag_deleted", value: false },
    { field: "change_log_id", value: null },
    { field: "timestamp", value: timestamp },
    { field: "refrence_id", value: refreshId },
  ];
  console.log(JSON.stringify(fieldArr));
  var result = await crud.makeInsertQueryString("driver", fieldArr, true);
  return result;
};

const getDriverDetailByMobileNumber = async (mobileNumber) => {
  var sql = `select * from driver where driver_mobile_number = '${mobileNumber}' and history_id is null and flag_deleted = false`;
  var result = await crud.executeQuery(sql);
  return result;
};

const getDriverDetailByEmailId = async (emailId) => {
  var sql = `select * from driver where driver_email = '${emailId}' and history_id is null and flag_deleted = false`;
  var result = await crud.executeQuery(sql);
  return result;
};

const creaetDriverDocument = async (driverObj) => {
  var result = await crud.makeInsertQueryString(
    "driver_document",
    driverObj,
    true
  );
  return result;
};

const getDriverDetailById = async (driverId) => {
  var sql = `select * from driver where driver_id = '${driverId}' and history_id is null and flag_deleted = false`;
  var result = await crud.executeQuery(sql);
  return result;
};

const createAuthOtp = async (otp, changeLogId, flagRider, expireTime) => {
  var sql = `INSERT INTO otp_auth(
    otp_auth_value, "change_log_id", flag_ride, expiry_time)
    VALUES ('${otp}','${changeLogId}','${flagRider}','${expireTime}');`;
  var result = await crud.executeQuery(sql);
  return result;
};

const getVerifiedOtp = async (userId) => {
  var sql = `select * from otp_auth
  join driver_log
  on driver_log.driver_log_id = otp_auth.change_log_id
  where driver_id = '${userId}' and history_id is null and (flag_verified is null or flag_verified = false )
  and flag_ride = false
  order by otp_auth_id desc
  LIMIT 1`;
  var result = await crud.executeQuery(sql);
  return result;
};

const updateMobileNumberFlag = async (driverId, timestamp, changeLogId) => {
  var sql = `update driver set flag_verified = true, timestamp = '${timestamp}' ,change_log_id = '${changeLogId}' where driver_id = '${driverId}'`;
  var result = await crud.executeQuery(sql);
  return result;
};

const updateOtpFlag = async (otpAuthId, changeLogId) => {
  var sql = `update otp_auth set flag_verified = true ,change_log_id = '${changeLogId}' where otp_auth_id = '${otpAuthId}'`;
  var result = await crud.executeQuery(sql);
  return result;
};

module.exports = {
  createDriverProfile: createDriverProfile,
  getDriverDetailByMobileNumber: getDriverDetailByMobileNumber,
  getDriverDetailByEmailId: getDriverDetailByEmailId,
  creaetDriverDocument: creaetDriverDocument,
  getDriverDetailById: getDriverDetailById,
  createAuthOtp: createAuthOtp,
  getVerifiedOtp: getVerifiedOtp,
  updateMobileNumberFlag: updateMobileNumberFlag,
  updateOtpFlag: updateOtpFlag,
};
