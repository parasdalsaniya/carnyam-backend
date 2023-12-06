const crud = require("../../crud");

const insert = async () => {
  var sql = `Insert into test values ('2','Vivek')`;
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

module.exports = {
  insert: insert,
  authAddAuthLogDB,
  getOutboundApiAppAuthLogByStateToken,
  updateStateToken,
};
