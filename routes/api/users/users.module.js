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

  var userAddress = await userDb.getUserAddressbyUserId(userId);
  if (userAddress.status == false) {
    return {
      status: false,
      error: constants.requestMessages.ERR_SOMTHIN_WENT_WRONG,
    };
  }
  var address;
  if (userAddress.data.length == 0) {
    address = {
      user_address_id: null,
      city_id: null,
      district_id: null,
      street: null,
      gst_number: null,
    };
  } else {
    address = {
      user_address_id: userAddress.data[0].user_address_id,
      city_id: userAddress.data[0].user_address_city_id,
      district_id: userAddress.data[0].user_address_district_id,
      street: userAddress.data[0].user_address_street,
      gst_number: userAddress.data[0].gst_number,
    };
  }

  userDetail = userDetail.data[0];
  delete userDetail["history_id"];
  delete userDetail["flag_deleted"];
  delete userDetail["timestamp"];
  delete userDetail["change_log_id"];
  userDetail["user_address"] = address;
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
  // var userId = req.user_id;
  var mobileNumber = req.body.mobile;
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

  const userDetail = await userDb.getUserDetailbyMobileNumber(mobileNumber);
  if (userDetail.status == false || userDetail.data.length == 0) {
    return {
      status: false,
      error: constants.requestMessages.ERR_USER_NOT_FOUND,
    };
  }
  var userId = userDetail.data[0].user_id;
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
  var userId = null; //req.user_id;
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

  var userDetail = await userDb.getUserDetailbyMobileNumber(mobileNumber);

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

const updateUserModule = async (req) => {
  // req.body = await libFunction.trimValues(req.body);

  var name = req.body.user_name;
  var street = req.body.street;
  var districtId = req.body.district_id;
  var cityId = req.body.city_id;
  var gstNo = req.body.gst_number;
  var storageId = req.body.storage_id;
  var userId = req.user_id;
  var timestamp = await libFunction.formatDateTimeLib(new Date());
  var userAddressDetail = await userDb.getUserAddressbyUserId(userId);

  if (userAddressDetail.status == false) {
    return {
      status: false,
      error: constants.requestMessages.ERR_SOMTHIN_WENT_WRONG,
    };
  }
  var changeLogId = await libFunction.changeLogDetailsLib({
    ipAddress: req.ip,
    userId: userId,
  });
  if (userAddressDetail.data.length == 0) {
    street = street == undefined || null || "" ? null : street;
    districtId = districtId == undefined || null || "" ? null : districtId;
    cityId = cityId == undefined || null || "" ? null : cityId;
    gstNo = gstNo == undefined || null || "" ? null : gstNo;
    var createUserAddress = await userDb.createUserAddress(
      street,
      districtId,
      cityId,
      gstNo,
      changeLogId,
      userId
    );

    if (
      createUserAddress.status == false ||
      createUserAddress.data.length == 0
    ) {
      return {
        status: false,
        error: constants.requestMessages.ERR_SOMTHIN_WENT_WRONG,
      };
    }
  } else {
    street =
      street == undefined || null || ""
        ? userAddressDetail.data[0].user_address_street
        : street;
    districtId =
      districtId == undefined || null || ""
        ? userAddressDetail.data[0].user_address_district_id
        : districtId;
    cityId =
      cityId == undefined || null || ""
        ? userAddressDetail.data[0].user_address_city_id
        : cityId;
    gstNo =
      gstNo == undefined || null || ""
        ? userAddressDetail.data[0].gst_number
        : gstNo;

    await libFunction.InsertQuery(
      "user_address",
      "user_address_id",
      userAddressDetail.data[0].user_address_id
    );

    var updateAddress = await userDb.updateUserAddress(
      street,
      districtId,
      cityId,
      gstNo,
      changeLogId,
      userAddressDetail.data[0].user_address_id
    );

    if (updateAddress.status == false) {
      return {
        status: false,
        error: constants.requestMessages.ERR_SOMTHIN_WENT_WRONG,
      };
    }
  }

  var userDetail = await userDb.getUserDetailbyUserId(userId);

  if (userDetail.data.length == 0 || userDetail.status == false) {
    return {
      status: false,
      error: constants.requestMessages.ERR_USER_NOT_FOUND,
    };
  }

  name = name == undefined || null || "" ? userDetail.data[0].user_name : name;
  storageId =
    storageId == undefined || null || ""
      ? userDetail.data[0].storage_id
      : storageId;
  var flagUpdateUSerDetail = false;
  if (name != userDetail.data[0].user_name) {
    flagUpdateUSerDetail = true;
  }

  if (storageId != userDetail.data[0].storage_id) {
    flagUpdateUSerDetail = true;
  }

  if (flagUpdateUSerDetail == true) {
    await libFunction.InsertQuery("public.user", "user_id", userId);

    name =
      name == undefined || "" || null ? userDetail.data[0].user_name : name;
    storageId =
      undefined || "" || null ? storageId.data[0].storage_id : storageId;

    var updateUserDetail = await userDb.updateUserNameAndStorageId(
      name,
      storageId,
      timestamp,
      changeLogId,
      userId
    );

    if (updateUserDetail.status == false) {
      return {
        status: false,
        error: constants.requestMessages.ERR_SOMTHIN_WENT_WRONG,
      };
    }
  }

  var userDetail = await getUserDetailModule(req);
  return userDetail;
};

const getDistrictModule = async (req) => {
  return await userDb.getDistrict();
};

const getCityModule = async (req) => {
  var cityId = req.query.district_id;

  if (cityId == undefined || null || "") {
    return {
      status: false,
      error: constants.requestMessages.ERR_INVALID_BODY,
    };
  }

  var cityDetail = await userDb.getCityByDistrictId(cityId);
  var cityDetailMap = cityDetail.data.map((x) => {
    return {
      city_id: x.sub_district_id,
      state_id: x.state_id,
      district_id: x.district_id,
      city_name: x.sub_district_name,
    };
  });

  return { status: true, data: cityDetailMap };
};

module.exports = {
  getUserDetailModule: getUserDetailModule,
  sendOtpForLoginModule: sendOtpForLoginModule,
  verifyOtpForLoginModule: verifyOtpForLoginModule,
  updateUserModule: updateUserModule,
  getDistrictModule: getDistrictModule,
  getCityModule: getCityModule,
};
