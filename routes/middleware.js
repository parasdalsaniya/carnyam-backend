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
  const sql = `select user_id,flag_driver from user_access_token where user_access_token_value = '${accessToken}' and user_access_token_flag_logout=false `;
  const getUserIdByATokenDB = await crud.executeQuery(sql);
  console.log(getUserIdByATokenDB);
  console.log(getUserIdByATokenDB);
  if (getUserIdByATokenDB.data.length == 0) {
    if (accessToken != process.env.PUBLIC_ACCETOKEN) {
      return res.status(401).send({
        status: false,
        error: {
          code: 401,
          message: "Error invalid authentication found ...................",
        },
      });
    } else {
      req.driver_id = 622003;
      next();
      return;
    }

    return res.status(401).send({
      status: false,
      error: {
        code: 401,
        message: "Error invalid authentication found.",
      },
    });
  }
  if (getUserIdByATokenDB.data[0].flag_driver == false) {
    req.user_id = getUserIdByATokenDB.data[0].user_id;
  } else {
    req.driver_id = getUserIdByATokenDB.data[0].user_id;
  }
  req.access_token_data = accessToken;
  next();
};

const checkSocketAccessToken = async (socket, next) => {
  try {
    const authTokenHeader = socket.handshake.headers.authorization;
    console.log('socket.handshake.headers.authorization-> ', authTokenHeader)

    if (!authTokenHeader)
      throw new Error('Token not found.');

    const accessToken = authTokenHeader.replace("Bearer ", "");

    if (!accessToken) {
      console.log("There is no Token");
      throw new Error("There is no Token")
    }

    const sql = `select user_id,flag_driver from user_access_token where user_access_token_value = '${accessToken}' and user_access_token_flag_logout=false `;
    const getUserIdByATokenDB = await crud.executeQuery(sql);
    console.log(getUserIdByATokenDB);

    if (getUserIdByATokenDB.data.length == 0) 
      throw new Error("Error invalid authentication found.")

    socket.driver_id = getUserIdByATokenDB.data[0].user_id;
    socket.access_token_data = accessToken;
    return true
  } catch (error) {
    console.log('Error in checkSocketAccessToken: ', error.message)
    throw error
  }
}

module.exports = {
  checkAccessToken: checkAccessToken,
  checkSocketAccessToken,
};
