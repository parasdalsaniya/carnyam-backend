const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const libFunction = require("../../../helpers/libFunction");
const authDb = require("./auth.db");
var syncRequest = require("sync-request");
var constant = require("../../../helpers/consts");
var path = require("path");
var userModule = require("../users/users.module");
const { error } = require("console");
// var data = require("../../../public");
const googleSignUpModule = async (req) => {
  var clientID = process.env.CLIENT_ID;
  var redirectUri;
  console.log(process.env.CARNYAM_TESTMODE);
  if (process.env.CARNYAM_TESTMODE == "false") {
    redirectUri = "http://localhost:4001/api/auth/google/callback";
  } else {
    redirectUri = "http://193.203.163.33:4001/api/auth/google/callback";
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

const signUpWithPasswordModule = async (req, res) => {
  try {
    var userName = req.body.user_name;
    var userEmail = req.body.user_email;
    var password = req.body.password;
    var userMobile = req.body.mobile;
    var gender = req.body.gender_id;
    var storageId = req.body.storage_id;
    var googleFlag = req.body.google_flag;
    var flagEmailVerified = false;
    if (password == undefined || password == "" || password == null) {
      password == null;
    }
    if (
      userName == undefined ||
      userName == null ||
      userName == "" ||
      userEmail == undefined ||
      userEmail == "" ||
      userEmail == null
    ) {
      return {
        status: false,
        error: constant.requestMessages.ERR_INVALID_BODY,
      };
    }

    if (googleFlag == false || googleFlag == undefined) {
      if (userMobile == "" || userMobile == undefined || userMobile == null) {
        return {
          status: false,
          error: constant.requestMessages.ERR_INVALID_BODY,
        };
      }
      const userByMobileNumber = await authDb.getUser({
        user_mobile_number: userMobile,
      });

      if (userByMobileNumber.data.length != 0) {
        // if (userByMobileNumber.data[0].flag_mobile_verified == true) {
        return {
          status: false,
          error: {
            message: "User is already register with mobile number.",
          },
        };
        // }
      }
    } else {
      flagEmailVerified = true;
    }

    const userByEmailId = await authDb.getUser({ user_email: userEmail });
    if (userByEmailId.data.length != 0) {
      // if (userByEmailId.data[0].flag_email_verified == true) {
      return {
        status: false,
        error: {
          message: "User is already register with email.",
        },
      };
      // }
    }

    const timestamp = await libFunction.formatDateTimeLib(new Date());
    var hashedPassword = null;
    if (password != null) {
      hashedPassword = await bcrypt.hash(password, 12);
    }
    gender =
      gender == null || gender == undefined || gender == "" ? null : gender;

    const result = await authDb.createUser({
      name: userName,
      email: userEmail,
      password: hashedPassword,
      mobile: userMobile,
      gender,
      profileImage: storageId,
      timestamp,
      flagEmailVerified: flagEmailVerified,
    });
    if (result.status === false) {
      return {
        status: false,
        error: constant.requestMessages.ERR_SOMTHIN_WENT_WRONG,
      };
    }

    const otp = await libFunction.generateOTP(6);
    await libFunction.sendMail(
      userEmail,
      `<h1>${otp}</h1>`,
      "Verification Email"
    );

    var obj = {
      userId: result.data[0].user_id,
      ipAddress: req.ip,
    };

    var changeLogId = await libFunction.changeLogDetailsLib(obj);

    var expireTime = await libFunction.expiryTimeInMin(2);

    await authDb.createAuthOtp(otp, changeLogId, true, expireTime);

    var userDetailWithAceeToken = await createAcessTokenWithUserDetail(
      result.data[0].user_id
    );
    return userDetailWithAceeToken;
  } catch (error) {
    throw error;
  }
};

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

  var userDetail = await userModule.getUserDetailModule({
    user_id: userId,
  });
  userDetail.data["accessToken"] = token;
  return userDetail;
}

const signInWithPasswordModule = async (req) => {
  try {
    const { email, password } = req.body;

    const user = await authDb.getUser({ user_email: email });
    if (!user.data.length) throw new Error("User not found");

    const isValidPassword = await bcrypt.compareSync(
      password,
      user.data[0].user_password
    );
    if (!isValidPassword) throw new Error("Invalid cradentils.");
    const jwtToken = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return { ...user.data[0], token: jwtToken };
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

const googleCallBackModule = async (req) => {
  try {
    var code = req.query.code;
    var state = req.query.state;
    var scope = req.query.scope;
    var authuser = req.query.authuser;
    var hd = req.query.hd == undefined ? null : req.query.hd;
    if (process.env.CARNYAM_TESTMODE == "false") {
      redirectUri = "http://localhost:4001/api/auth/google/callback";
    } else {
      redirectUri = "http://193.203.163.33:4001/api/auth/google/callback";
    }
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

    var userDetailByEmail = await authDb.getUserByEmailId(email);

    if (userDetailByEmail.status == false) {
      return {
        status: false,
        error: constant.requestMessages.ERR_SOMTHIN_WENT_WRONG,
      };
    }

    if (userDetailByEmail.data.length == 0) {
      await libFunction.downloadImage(userImage, imagePath); // Image Download Sucess

      var userDetail = await signUpWithPasswordModule({
        body: {
          user_name: `${firstName} ${lastName}`,
          user_email: `${email}`,
          password: null,
          mobile: null,
          gender_id: null,
          storage_id: null,
          google_flag: true,
        },
      });
      return userDetail;
    } else {
      var getUserDetail = createAcessTokenWithUserDetail(
        userDetailByEmail.data[0].user_id
      );
      return getUserDetail;
    }
  } catch (e) {
    console.log(e);
    return {
      status: false,
      error: e,
    };
  }
};
module.exports = {
  googleSignUpModule,
  signUpWithPasswordModule,
  signInWithPasswordModule,
  googleCallBackModule,
};
