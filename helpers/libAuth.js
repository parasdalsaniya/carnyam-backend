const libFunction = require("./libFunction");
const authDb = require("../routes/api/auth/auth.db");
const constant = require("./consts");
const userModule = require("../routes/api/users/users.module");

async function createAcessTokenWithUserDetail(userId) {
  var timestamp = await libFunction.formatDateTimeLib(new Date());
  const token = (await libFunction.makeid(64)) + new Date().getTime();
  var expireAccessTokenTime = await libFunction.formatDateLib(
    await libFunction.getExpireTimeStamp(true)
  );
  const userAccessToken = await authDb.creaetUserAccessToken(
    userId,
    token,
    timestamp,
    expireAccessTokenTime
  );

  if (userAccessToken.status == false) {
    return {
      status: false,
      error: constant.requestMessages.ERR_WHILE_EXCUTING_MYSQL_QUERY,
    };
  }
  return token;
}

async function createDriverAcessToken(driverId) {
  var timestamp = await libFunction.formatDateTimeLib(new Date());
  const token = (await libFunction.makeid(64)) + new Date().getTime();
  var expireAccessTokenTime = await libFunction.formatDateLib(
    await libFunction.getExpireTimeStamp(true)
  );
  const userAccessToken = await authDb.creaetDriverAccessToken(
    driverId,
    token,
    timestamp,
    expireAccessTokenTime
  );

  if (userAccessToken.status == false) {
    return {
      status: false,
      error: constant.requestMessages.ERR_WHILE_EXCUTING_MYSQL_QUERY,
    };
  }
  return token;
}

module.exports = {
  createAcessTokenWithUserDetail: createAcessTokenWithUserDetail,
  createDriverAcessToken: createDriverAcessToken,
};
