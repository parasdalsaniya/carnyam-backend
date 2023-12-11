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
  where user_id = '${userId}' and history_id is null and (flag_verified is null or flag_verified = false )
  order by otp_auth_id desc
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

const getUserAddressbyUserId = async (userId) => {
  var sql = `select * from user_address where history_id is null and flag_deleted = false and user_id = '${userId}'`;
  var result = await crud.executeQuery(sql);
  return result;
};

const createUserAddress = async (
  street,
  districtId,
  cityId,
  gstNo,
  changeLogId,
  userId
) => {
  street = street == null ? null : `'${street}'`;
  districtId = districtId == null ? null : `'${districtId}'`;
  cityId = cityId == null ? null : `'${cityId}'`;
  gstNo = gstNo == null ? null : `'${gstNo}'`;
  var sql = `INSERT INTO user_address(
    user_address_city_id, user_address_district_id,user_address_street, flag_deleted, change_log_id, gst_number, storage_id, user_id)
    VALUES (${cityId}, ${districtId}, ${street}, 'false', '${changeLogId}', ${gstNo},null,'${userId}') returning * ;`;
  var result = await crud.executeQuery(sql);
  return result;
};

const updateUserAddress = async (
  street,
  districtId,
  cityId,
  gstNo,
  changeLogId,
  userAddressId
) => {
  street = street == null ? null : `'${street}'`;
  districtId = districtId == null ? null : `'${districtId}'`;
  cityId = cityId == null ? null : `'${cityId}'`;
  gstNo = gstNo == null ? null : `'${gstNo}'`;

  var sql = `update user_address set user_address_city_id = ${cityId},
  user_address_district_id = ${districtId},
  user_address_street = ${street},
  gst_number = ${gstNo},
  change_log_id = ${changeLogId} where user_address_id = '${userAddressId}'`;
  var result = await crud.executeQuery(sql);
  return result;
};

var updateUserNameAndStorageId = async (
  name,
  storageId,
  timestamp,
  changeLogId,
  userId
) => {
  name = name == null ? null : `'${name}'`;
  storageId = storageId == null ? null : `'${storageId}'`;
  var sql = `update public.user set storage_id = ${storageId},user_name = ${name} ,change_log_id = '${changeLogId}' ,timestamp = '${timestamp}' where user_id = '${userId}' and history_id is null and flag_deleted = false`;
  var result = await crud.executeQuery(sql);
  return result;
};

const getDistrict = async () => {
  var sql = `select * from district order by district_name`;
  var result = await crud.executeQuery(sql);
  return result;
};

const getCityByDistrictId = async (cityId) => {
  var sql = `select * from sub_district where district_id = '${cityId}' order by sub_district_name `;
  var result = await crud.executeQuery(sql);
  return result;
};

const deleteUser = async (userId) => {
  var sql = `update public.user set flag_deleted = true where user_id = '${userId}'`;
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
  getUserAddressbyUserId,
  updateUserAddress,
  createUserAddress,
  updateUserNameAndStorageId,
  getDistrict,
  getCityByDistrictId,
  deleteUser,
};
