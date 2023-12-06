const router = require("express").Router();
const libFunction = require("../../../helpers/libFunction");
const authDb = require("./auth.db");
var syncRequest = require("sync-request");
var constant = require("../../../helpers/consts");
var path = require("path");
// var data = require("../../../public");
const googleSignUpModule = async (req) => {
  var clientID = process.env.CLIENT_ID;
  var redirectUri;
  console.log(process.env.FILEMASTER_TESTMODE);
  if (process.env.FILEMASTER_TESTMODE == "false") {
    redirectUri = "http://localhost:4001/api/auth/google/callback";
  } else {
    redirectUri = "https://api.filemaster.io/api/auth/google/callback";
  }
  var googleloginUrl = process.env.GOOGLE_LOGIN_URL;
  var code = null;
  var string = await libFunction.makeid(32);
  var timestamp = await libFunction.formatDateTimeLib(new Date());
  var googleUrl = `${googleloginUrl}?redirect_uri=${redirectUri}&response_type=code&client_id=${clientID}&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+openid&access_type=offline&state=${string}`;
  const authLog = await authDb.authAddAuthLogDB({
    outhId: 1,
    timestamp: timestamp,
    string: string,
    googleUrl: googleUrl,
    code: code,
  });

  if (authLog.status == false) {
    return {
      status: false,
      error: constant.requestMessages.ERR_SOMTHIN_WENT_WRONG,
    };
  }
  return { status: true, url: googleUrl };
};

const signUpWithPasswordModule = async () => {
  try {
    console.log("signUpWithPasswordModule");
  } catch (error) {
    throw error;
  }
};

const signInWithPasswordModule = async () => {
  try {
    console.log("signInWithPasswordModule");
  } catch (error) {
    throw error;
  }
};

const googleCallBackModule = async (req) => {
  try {
    var code = req.query.code;
    var state = req.query.state;
    var scope = req.query.scope;
    var authuser = req.query.authuser;
    var hd = req.query.hd;
    var redirectUri = "http://localhost:4001/api/auth/google/callback";
    var timestamp = await libFunction.formatDateTimeLib(new Date());
    if (code == undefined || code == "" || code == null) {
      return {
        status: false,
        error: constant.requestMessages.ERR_LOGIN_FAILD,
      };
    }
    var url = `${redirectUri}?state=${state}&code=${code}&scope=${scope}&authuser=${authuser}&hd=${hd}`;

    const stateToken = await authDb.getOutboundApiAppAuthLogByStateToken(state);
    if (stateToken.status == false || stateToken.data.length == 0) {
      return {
        status: false,
        error: constant.requestMessages.ERR_SOMTHIN_WENT_WRONG,
      };
    }
    ``;
    const updateStateCode = await authDb.updateStateToken(
      stateToken.data[0].outbound_api_app_auth_log_id,
      code,
      url,
      timestamp
    );

    if (updateStateCode.status == false) {
      return {
        status: false,
        error: constant.requestMessages.ERR_WHILE_EXCUTING_MYSQL_QUERY,
      };
    }

    var clientID = process.env.CLIENT_ID;
    var clientSecret = process.env.CLIENT_SECRET;

    var res = await syncRequest("POST", process.env.GOOGLE_POST_URL, {
      json: {
        code: code,
        client_id: clientID,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      },
    });

    if (res.statusCode == 400) {
      return {
        status: false,
        error: res,
      };
    }

    var user = JSON.parse(res.getBody("utf8"));

    var access_token = user.access_token;
    var refresh_token = user.refresh_token;

    var profileData = syncRequest(
      "GET",
      `${process.env.GOOGLE_AUTH_V_THREE}?access_token=${access_token}`
    );

    if (profileData.statusCode == 400) {
      return {
        status: false,
        error: constant.requestMessages.ERR_BAD_REQUEST,
      };
    }

    var data = JSON.parse(profileData.getBody("utf8"));

    var firstName = data.given_name;
    var lastName = data.family_name;
    var email = data.email;
    var userImage = data.picture;
    var imagePath = path.join(
      __dirname,
      `../../../public/${firstName}_${lastName}_${new Date().getTime()}.png`
    );
    var imageUrl = await libFunction.downloadImage(userImage, imagePath);
    return data;
  } catch (e) {
    console.log(e);
    return {
      status: false,
      error: e,
    };

module.exports = {
  googleSignUpModule,
  signUpWithPasswordModule,
  signInWithPasswordModule,
  googleCallBackModule,
};
