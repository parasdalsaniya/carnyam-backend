const router = require("express").Router();
const { error } = require("console");
const libFunction = require("../../../helpers/libFunction");
const userDb = require("./users.db");
var path = require("path");
const constants = require("../../../helpers/consts");
const authDb = require("../auth/auth.db");
// User Detail (/users/me)
const getUserDetailModule = async (req) => {
  var userId = req.user_id;
  if (userId == undefined || userId == null || userId == undefined) {
    return {
      status: false,
      error: "User Not Found",
    };
  }

  var userDetail = await userDb.getUserDetailbyUserId(userId);

  if (userDetail.status == false || userDetail.data.length == 0) {
    return {
      status: false,
      error: "User Not Found",
    };
  }
  userDetail = userDetail.data[0];
  delete userDetail["history_id"];
  delete userDetail["flag_deleted"];
  delete userDetail["timestamp"];
  delete userDetail["change_log_id"];
  userDetail["mobile"] = userDetail.user_mobile_number;
  var result = {
    status: true,
    data: {
      ...userDetail,
    },
  };
  return result;
};

// User Login (/users/login)
const sendOtpForLoginModule = async (req) => {
  var userId = req.user_id;
  var mobileNumber = req.body.mobile;
  console.log(
    userId,
    ":::::::::::::::::::::::::::::::::::::::::::::::::::::::::;"
  );

  if (
    mobileNumber == undefined ||
    mobileNumber == "" ||
    mobileNumber == null ||
    mobileNumber.trim().length != 10
  ) {
    return {
      status: false,
      error: constants.requestMessages.ERR_INVALID_BODY,
    };
  }

  const userDetail = await userDb.getUserDetailbyUserId(userId);
  if (userDetail.status == false || userDetail.data.length == 0) {
    return {
      status: false,
      error: constants.requestMessages.ERR_USER_NOT_FOUND,
    };
  }
  mobileNumber = mobileNumber.trim();
  var timestamp = await libFunction.formatDateTimeLib(new Date());
  var changeLogId = await libFunction.changeLogDetailsLib({
    userId: userId,
    ipAddress: req.ip,
  });
  if (userDetail.data[0].user_mobile_number != mobileNumber) {
    await libFunction.InsertQuery("public.user", "user_id", userId);
    var updateUserMobile = await userDb.updateMobileNumber(
      userId,
      mobileNumber,
      timestamp,
      changeLogId
    );

    if (updateUserMobile.status == false) {
      return {
        status: false,
        error: constants.requestMessages.ERR_SOMTHIN_WENT_WRONG,
      };
    }
  }
  const otp = await libFunction.generateOTP(6);
  var expireTime = await libFunction.expiryTimeInMin(2);
  await authDb.createAuthOtp(otp, changeLogId, true, expireTime);
  await libFunction.sendMail(
    userDetail.data[0].user_email,
    `<h1>${otp}</h1>`,
    "Verify Phone Number"
  );
  var result = {
    status: true,
    data: "Otp Send Successfully",
  };
  return result;
};

const verifyOtpForLoginModule = async (req) => {
  var mobileNumber = req.body.mobile;
  var userId = req.user_id;
  var otp = req.body.otp;
  if (
    (mobileNumber == undefined ||
      mobileNumber == "" ||
      mobileNumber == null ||
      mobileNumber.trim().length != 10,
    otp == undefined,
    otp == "",
    otp == null)
  ) {
    return {
      status: false,
      error: constants.requestMessages.ERR_INVALID_BODY,
    };
  }

  var userDetail = await userDb.getUserDetailbyUserId(userId);

  if (userDetail.data.length == 0 || userDetail.data.length == 0) {
    return {
      status: false,
      error: constants.requestMessages.ERR_USER_NOT_FOUND,
    };
  }

  var getLastOtp = await userDb.getVerifiedOtp(userId);

  if (getLastOtp.status == false || getLastOtp.data.length == 0) {
    return {
      status: false,
      error: constants.requestMessages.ERR_SOMTHIN_WENT_WRONG,
    };
  }

  if (otp != getLastOtp.data[0].otp_auth_value) {
    return {
      status: false,
      error: constants.requestMessages.ERR_INVALID_OTP,
    };
  }
  var timestamp = await libFunction.formatDateTimeLib(new Date());
  var changeLogId = await libFunction.changeLogDetailsLib({
    userId: userId,
    ipAddress: req.ip,
  });
  if (userDetail.data[0].flag_mobile_verified == false) {
    await libFunction.InsertQuery("public.user", "user_id", userId);
    var updateMobileFlag = await userDb.updateMobileNumberFlag(
      userId,
      timestamp,
      changeLogId
    );

    if (updateMobileFlag.status == false) {
      return {
        status: false,
        error: constants.requestMessages.ERR_SOMTHIN_WENT_WRONG,
      };
    }
  }

  await libFunction.InsertQuery(
    "otp_auth",
    "otp_auth_id",
    getLastOtp.data[0].otp_auth_id
  );

  var updateOtpFlag = await userDb.updateOtpFlag(
    getLastOtp.data[0].otp_auth_id,
    changeLogId
  );

  if (updateOtpFlag.status == false) {
    return {
      status: false,
      error: constants.requestMessages.ERR_SOMTHIN_WENT_WRONG,
    };
  }

  return { status: true, data: "OTP Verify Successfully" };
};

module.exports = {
  getUserDetailModule: getUserDetailModule,
  sendOtpForLoginModule: sendOtpForLoginModule,
  verifyOtpForLoginModule: verifyOtpForLoginModule,
};
