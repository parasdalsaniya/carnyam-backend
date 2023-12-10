const crud = require("./crud");

const checkAccessToken = async (req, res, next) => {
  console.log(
    "Cookies:::::::::::::::::::::::::::::::::::::::::::::::::::::",
    req.cookies["cn-ssid"]
  );

  var authTokenHeader = req.cookies["cn-ssid"] || req.headers["authorization"];
  if (authTokenHeader) authTokenHeader = authTokenHeader.replace("Bearer ", "");
  var accessToken = authTokenHeader;
  console.log(accessToken);
  if (accessToken === undefined) {
    console.log("There is no Token");
    return res.status(401).send({
      status: false,
      error: {
        code: 401,
        message: "Error invalid authentication found ...................",
      },
    });
  }
  var date = new Date();

  let currentTimeStamp = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  const sql = `select user_id from user_access_token where user_access_token_value = '${accessToken}' and user_access_token_expiry_time >= '${currentTimeStamp}'and user_access_token_flag_logout=false `;
  const getUserIdByATokenDB = await crud.executeQuery(sql);
  console.log(getUserIdByATokenDB);
  console.log(getUserIdByATokenDB);
  if (getUserIdByATokenDB.data.length == 0) {
    return res.status(401).send({
      status: false,
      error: {
        code: 401,
        message: "Error invalid authentication found.",
      },
    });
  }
  req.user_id = getUserIdByATokenDB.data[0].user_id;
  req.access_token_data = accessToken;
  next();
};
module.exports = {
  checkAccessToken: checkAccessToken,
};
