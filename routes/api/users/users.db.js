const crud = require("../../crud");

const getUserDetailbyUserId = async (userId) => {
  var sql = `select * from public.user where user_id = '${userId}' and history_id is null and flag_deleted = false`;
  var result = await crud.executeQuery(sql);
  return result;
};

const getUserDetailbyMobileNumber = async (mobileNumber) => {
  var sql = `select * from public.user where user_mobile_number = '${mobileNumber}' and history_id is null and flag_deleted = false `;
  var result = await crud.executeQuery(sql);
  return result;
};

const updateMobileNumber = async (
  userId,
  mobileNumber,
  timestamp,
  changeLogId
) => {
  var sql = `update public."user" set user_mobile_number = '${mobileNumber}' , timestamp = '${timestamp}' ,change_log_id = '${changeLogId}' where user_id = '${userId}' `;
  var result = await crud.executeQuery(sql);
  return result;
};

const getVerifiedOtp = async (userId) => {
  var sql = `select * from otp_auth
  join change_log
  on change_log.change_log_id = otp_auth.change_log_id
  where user_id = '${userId}'
  order by expiry_time desc
  LIMIT 1`;
  var result = await crud.executeQuery(sql);
  return result;
};

const updateMobileNumberFlag = async (userId, timestamp, changeLogId) => {
  var sql = `update public."user" set flag_mobile_verified = true, timestamp = '${timestamp}' ,change_log_id = '${changeLogId}' where user_id = '${userId}'`;
  var result = await crud.executeQuery(sql);
  return result;
};

const updateOtpFlag = async (otpAuthId, changeLogId) => {
  var sql = `update otp_auth set flag_verified = true ,change_log_id = '${changeLogId}' where otp_auth_id = '${otpAuthId}'`;
  var result = await crud.executeQuery(sql);
  return result;
};

module.exports = {
  getUserDetailbyUserId,
  getUserDetailbyMobileNumber,
  updateMobileNumber,
  getVerifiedOtp,
  updateMobileNumberFlag,
  updateOtpFlag,
};
