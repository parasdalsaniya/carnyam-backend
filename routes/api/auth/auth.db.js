const crud = require("../../crud");

const createUser = async ({
  name,
  email,
  password,
  mobile,
  gender,
  profileImage,
  timestamp,
  authId,
  flagEmailVerified,
}) => {
  const auth = authId ? `'${authId}'` : null;
  password = password == null ? null : `'${password}'`;
  profileImage = profileImage == null ? null : `'${profileImage}'`;
  gender =
    gender == null || gender == undefined || gender == ""
      ? null
      : `'${gender}'`;
  mobile = mobile == null ? null : `'${mobile}'`;
  var sql = `INSERT INTO public."user"(
    user_name, user_email, user_password, user_mobile_number, gender_id, storage_id, "timestamp", oauth_id,flag_email_verified)
    VALUES ('${name}', '${email}', ${password}, ${mobile},${gender}, ${profileImage}, '${timestamp}', ${auth},${flagEmailVerified}) returning *;`;
  var result = await crud.executeQuery(sql);
  return result;
};

const authAddAuthLogDB = async ({
  outhId,
  timestamp,
  string,
  googleUrl,
  code,
}) => {
  var sql = `INSERT INTO outbound_api_app_auth_log 
  (outbound_api_app_id,outbound_api_app_auth_log_state_token,outbound_api_app_auth_log_auth_url,outbound_api_app_auth_log_code,timestamp)
  VALUES (${outhId},'${string}','${googleUrl}','${code}','${timestamp}') returning *  `;
  var result = await crud.executeQuery(sql);
  return result;
};

const getOutboundApiAppAuthLogByStateToken = async (stateToken) => {
  var sql = `select * from outbound_api_app_auth_log where outbound_api_app_auth_log_state_token = '${stateToken}'`;
  var result = await crud.executeQuery(sql);
  return result;
};

const updateStateToken = async (
  outboundApiAppAuthLogId,
  code,
  url,
  timestamp
) => {
  var sql = `update outbound_api_app_auth_log set outbound_api_app_auth_log_code = '${code}',timestamp = '${timestamp}', outbound_api_app_auth_log_auth_url = '${url}'  where outbound_api_app_auth_log_id = ${outboundApiAppAuthLogId}`;
  var result = await crud.executeQuery(sql);
  return result;
};
const getUser = async (params) => {
  let sql = `SELECT * FROM public."user" WHERE flag_deleted=false AND history_id IS NULL`;

  if (params) {
    sql += ` AND (`;

    let conditions = [];
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key];
        if (value !== undefined && value !== null && value !== "") {
          conditions.push(` ${key} = '${value}'`);
        }
      }
    }

    sql += conditions.join(" AND ");
    sql += `)`;
  }

  sql += ";";

  const result = await crud.executeQuery(sql);
  return result;
};

const updateUser = async ({ email, mobile }, updatedFields) => {
  let sql = `UPDATE public."user" SET`;

  const updateFields = [];
  for (const key in updatedFields) {
    if (Object.prototype.hasOwnProperty.call(updatedFields, key))
      updateFields.push(`${key} = '${updatedFields[key]}'`);
  }

  sql += ` ${updateFields.join(", ")} WHERE (user_email='${
    email || ""
  }' OR user_mobile_number='${
    mobile || ""
  }') AND flag_deleted=false AND history_id IS NULL RETURNING *;`;

  const result = await crud.executeQuery(sql);
  return result;
};

const createAuthOtp = async (otp, changeLogId, flagRider, expireTime) => {
  var sql = `INSERT INTO otp_auth(
    otp_auth_value, "change_log_id", flag_ride, expiry_time)
    VALUES ('${otp}','${changeLogId}','${flagRider}','${expireTime}');`;
  var result = await crud.executeQuery(sql);
  return result;
};

const creaetUserAccessToken = async (
  userId,
  accessToken,
  timestamp,
  expiryTime
) => {
  var sql = `insert into user_access_token (user_id,user_access_token_value,user_access_token_flag_logout,timestamp,user_access_token_expiry_time) values (${userId},'${accessToken}',false,'${timestamp}','${expiryTime}')`;
  var result = await crud.executeQuery(sql);
  return result;
};

module.exports = {
  authAddAuthLogDB,
  getOutboundApiAppAuthLogByStateToken,
  updateStateToken,
  createUser,
  getUser,
  updateUser,
  createAuthOtp,
  creaetUserAccessToken,
};
