const router = require("express").Router();
const { error } = require("console");
const libFunction = require("../../../helpers/libFunction");
const driverAuthDb = require("./driver_auth.db");
var path = require("path");
const constants = require("../../../helpers/consts");
const libStorage = require("../../../helpers/libStorage");
const libAuth = require("../../../helpers/libAuth");
const crud = require("../../crud");
const rideFare = require("../../../helpers/rideFare");
// Driver Profile Detail (/users/me)
function errorMessage(params) {
  return {
    status: false,
    error:
      params != undefined
        ? params
        : constants.requestMessages.ERR_SOMTHIN_WENT_WRONG,
  };
}

var Image = [".jpeg", ".jpg", ".png", ".gif"];
var Pdf = [".pdf"];
var ImagePdf = Image.concat(Pdf);

const getDriverProfileModule = async (req) => {
  var driverId = req.driver_id;

  console.log(driverId);

  if (driverId == undefined || driverId == null || driverId == "") {
    return errorMessage(constants.requestMessages.ERR_DRIVER_NOT_FOUND);
  }

  var driverDetail = await driverAuthDb.getDriverDetailById(driverId);

  if (driverDetail.status == false || driverDetail.data.length == 0) {
    return errorMessage(constants.requestMessages.ERR_DRIVER_NOT_FOUND);
  }

  var obj = {
    driver_id: driverDetail.data[0].driver_id,
    driver_name: driverDetail.data[0].driver_name,
    driver_mobile: driverDetail.data[0].driver_mobile_number,
    driver_email: driverDetail.data[0].driver_email,
    driver_address: driverDetail.data[0].driver_address,
    city_id: driverDetail.data[0].city_id,
    vehicle_id: driverDetail.data[0].vehicle_id,
    profile_image_id: driverDetail.data[0].driver_profile_id,
  };

  return { status: true, data: obj };
};

const createDriverProfileModule = async (req) => {
  // return await libFunction.quryObjectMacker("driver_document");
  var driverName = req.body.driver_name;
  var driverMobile = req.body.driver_mobile;
  var driverEmail = req.body.driver_email;
  var driverAddress = req.body.driver_address;
  var refreshId = req.body.refresh_id;
  var cityId = req.body.city_id;
  var driverLicanceId = req.body.driver_licance_id;
  var driverPanCardId = req.body.driver_pancard_id;
  var driverAddressProofId = req.body.driver_address_id;
  var driverBankDetailId = req.body.driver_bank_detail_id;
  var bloudeGroupId = req.body.blood_group_id;
  var profileImageId = req.body.profile_image_id;
  var vehicleId = req.body.vehicle_id;
  var validaction = [
    driverName,
    driverMobile,
    driverEmail,
    driverAddress,
    cityId,
    driverLicanceId,
    driverPanCardId,
    driverAddressProofId,
    driverBankDetailId,
    bloudeGroupId,
    profileImageId,
  ];
  var validate = await libFunction.objValidator(validaction);

  if (validate == false) {
    return errorMessage(constants.requestMessages.ERR_INVALID_BODY);
  }

  const emailRegexp = /^([a-zA-Z0-9\._]+)@([a-zA-Z)-9])+.([a-z]+)(.[a-z]+)?$/;

  if (!emailRegexp.test(driverEmail)) {
    return {
      status: false,
      error: constants.requestMessages.ERR_EMAIL_NOT_VALID,
    };
  }
  const mobileRejex = /^[0-9]{10}$/;

  if (!mobileRejex.test(driverMobile)) {
    return {
      status: false,
      error: constants.requestMessages.ERR_MOBILE_NOT_VALID,
    };
  }

  var driverDetailByMobile = await driverAuthDb.getDriverDetailByMobileNumber(
    driverMobile
  );

  if (driverDetailByMobile.status == false) {
    return errorMessage(constants.requestMessages.ERR_SOMTHIN_WENT_WRONG);
  }

  if (driverDetailByMobile.data.length != 0) {
    return errorMessage(constants.requestMessages.ERR_MOBILE_ALREADY_REGISTER);
  }

  var driverEmailDb = await driverAuthDb.getDriverDetailByEmailId(driverEmail);

  if (driverEmailDb.status == false) {
    return errorMessage(constants.requestMessages.ERR_SOMTHIN_WENT_WRONG);
  }

  if (driverEmailDb.data.length != 0) {
    return errorMessage(constants.requestMessages.ERR_EMAIL_ALREADY_REGISTER);
  }

  var timestamp = await libFunction.formatDateTimeLib(new Date());

  var storageId = [
    driverLicanceId,
    driverPanCardId,
    driverAddressProofId,
    driverBankDetailId,
    profileImageId,
  ];

  var googleStorage = await libStorage.getGoogleStorageById(
    storageId.join("','")
  );

  if (
    googleStorage.status == false
    // googleStorage.data.length != storageId.length
  ) {
    return errorMessage(constants.requestMessages.ERR_SOMTHIN_WENT_WRONG);
  }

  if (
    (await libStorage.fileTypeChack(
      profileImageId,
      googleStorage.data,
      Image
    )) == false
  ) {
    return errorMessage(constants.requestMessages.ERR_INVALID_FILE_TYPE);
  }
  console.log(":::::::::::::::");
  var ImagePdfArray = [
    driverLicanceId,
    driverPanCardId,
    driverAddressProofId,
    driverBankDetailId,
  ];

  await Promise.all(
    ImagePdfArray.map(async (x) => {
      var validate = await libStorage.fileTypeChack(
        x,
        googleStorage.data,
        ImagePdf
      );
      if (validate == false) {
        return errorMessage(constants.requestMessages.ERR_INVALID_FILE_TYPE);
      }
    })
  );
  var creaetDriver = await driverAuthDb.createDriverProfile(
    driverName,
    driverMobile,
    driverEmail,
    driverAddress,
    refreshId,
    cityId,
    vehicleId,
    timestamp,
    profileImageId
  );

  if (creaetDriver.status == false || creaetDriver.data.length == 0) {
    return errorMessage();
  }
  await crud.executeQuery(`update google_storage set flag_saved = true ,user_id = '${
    creaetDriver.data[0].driver_id
  }' , google_storage_flag_public = true 
  where google_storage_id in ('${ImagePdfArray.join(
    "','"
  )}') and user_id = 622003 and history_id is null and flag_deleted = false`);
  var driverLogId = await libFunction.driverLogDetailsLib({
    driverId: creaetDriver.data[0].driver_id,
    ipAddress: req.ip,
  });

  var driverDocument = [
    {
      field: "driver_id",
      value: creaetDriver.data[0].driver_id,
    },
    {
      field: "driving_license_id",
      value: driverLicanceId,
    },
    {
      field: "driver_pan_card_id",
      value: driverPanCardId,
    },
    {
      field: "driver_address_proof_id",
      value: driverAddressProofId,
    },
    {
      field: "driver_bank_id",
      value: driverBankDetailId,
    },
    {
      field: "driver_bgc_id",
      value: bloudeGroupId,
    },
    {
      field: "history_id",
      value: null,
    },
    {
      field: "flag_deleted",
      value: false,
    },
    {
      field: "change_log_id",
      value: driverLogId,
    },
  ];

  var creaetDriverDocument = await driverAuthDb.creaetDriverDocument(
    driverDocument
  );
  if (creaetDriverDocument.status == false) {
    await crud.executeQuery(
      `Delete from driver whare driver_id = '${creaetDriver.data[0].driver_id}'`
    );

    return errorMessage(constants.requestMessages.ERR_SOMTHIN_WENT_WRONG);
  }
  await rideFare.createDriverLiveLocation(creaetDriver.data[0].driver_id,timestamp)
  var accessToken = await libAuth.createDriverAcessToken(
    creaetDriver.data[0].driver_id
  );

  var driverDetail = await getDriverProfileModule({
    driver_id: creaetDriver.data[0].driver_id,
  });

  driverDetail.data["access_token"] = accessToken;

  return { status: true, data: driverDetail.data };
};

const updateDriverProfileModule = async (req) => {
  var driverName = req.body.driver_name;
  var driverMobile = req.body.driver_mobile;
  var driverEmail = req.body.driver_email;
  var driverAddress = req.body.driver_address;
  var refreshId = req.body.refresh_id;
  var cityId = req.body.city_id;
  var driverLicanceId = req.body.driver_licance_id;
  var driverPanCardId = req.body.driver_pancard_id;
  var driverAddressProofId = req.body.driver_address_id;
  var driverBankDetailId = req.body.driver_bank_detail_id;
  var bloudeGroupId = req.body.blood_group_id;
  var profileImageId = req.body.profile_image_id;
  var vehicleId = req.body.vehicle_id;
  var driverId = req.body.driver_id;

  if (driverId == undefined || driverId == null || driverId == undefined) {
    return errorMessage(constants.requestMessages.ERR_INVALID_BODY);
  }

  var driverDetail = await driverAuthDb.getDriverDetailById(driverId);

  if (driverDetail.status == false || driverDetail.data.length == 0) {
    return errorMessage(constants.requestMessages.ERR_DRIVER_NOT_FOUND);
  }

  driverName =
    driverName == null || undefined || "" ? driverDetail.data[0] : driverName;
  driverMobile =
    driverMobile == null || undefined || ""
      ? driverDetail.data[0]
      : driverMobile;
  driverEmail =
    driverEmail == null || undefined || "" ? driverDetail.data[0] : driverEmail;
  driverAddress =
    driverAddress == null || undefined || ""
      ? driverDetail.data[0]
      : driverAddress;
  refreshId =
    refreshId == null || undefined || "" ? driverDetail.data[0] : refreshId;
  cityId = cityId == null || undefined || "" ? driverDetail.data[0] : cityId;
  driverLicanceId =
    driverLicanceId == null || undefined || ""
      ? driverDetail.data[0]
      : driverLicanceId;
  driverPanCardId =
    driverPanCardId == null || undefined || ""
      ? driverDetail.data[0]
      : driverPanCardId;
  driverAddressProofId =
    driverAddressProofId == null || undefined || ""
      ? driverDetail.data[0]
      : driverAddressProofId;
  driverBankDetailId =
    driverBankDetailId == null || undefined || ""
      ? driverDetail.data[0]
      : driverBankDetailId;
  bloudeGroupId =
    bloudeGroupId == null || undefined || ""
      ? driverDetail.data[0]
      : bloudeGroupId;
  profileImageId =
    profileImageId == null || undefined || ""
      ? driverDetail.data[0]
      : profileImageId;
  vehicleId =
    vehicleId == null || undefined || "" ? driverDetail.data[0] : vehicleId;
};

const sendOtpDriverModule = async (req) => {
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

  const driverDetail = await driverAuthDb.getDriverDetailByMobileNumber(
    mobileNumber
  );
  if (driverDetail.status == false || driverDetail.data.length == 0) {
    return {
      status: false,
      error: constants.requestMessages.ERR_DRIVER_NOT_FOUND,
    };
  }
  var driverId = driverDetail.data[0].driver_id;
  mobileNumber = mobileNumber.trim();
  var timestamp = await libFunction.formatDateTimeLib(new Date());
  var changeLogId = await libFunction.driverLogDetailsLib({
    driverId: driverId,
    ipAddress: req.ip,
  });

  const otp = await libFunction.generateOTP(6);
  var expireTime = await libFunction.expiryTimeInMin(2);
  await driverAuthDb.createAuthOtp(otp, changeLogId, false, expireTime);
  console.log(driverDetail.data[0].driver_email);
  await libFunction.sendMail(
    driverDetail.data[0].driver_email,
    `<h1>${otp}</h1>`,
    "Verify Phone Number"
  );
  var result = {
    status: true,
    data: "Otp Send Successfully",
  };
  return result;
};

const loginOtpDriverModule = async (req) => {
  var mobileNumber = req.body.mobile;
  var driverId = null; //req.user_id;
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

  var driverDetail = await driverAuthDb.getDriverDetailByMobileNumber(
    mobileNumber
  );

  if (driverDetail.data.length == 0 || driverDetail.data.length == 0) {
    return {
      status: false,
      error: constants.requestMessages.ERR_DRIVER_NOT_FOUND,
    };
  }
  driverId = driverDetail.data[0].driver_id;
  var getLastOtp = await driverAuthDb.getVerifiedOtp(driverId);

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
  var expireTime = await libFunction.formatDateTimeLib(
    new Date(getLastOtp.data[0].expiry_time)
  );
  console.log(new Date(timestamp).getTime(), new Date(expireTime).getTime());
  if (new Date(timestamp).getTime() > new Date(expireTime).getTime()) {
    return {
      status: false,
      error: constants.requestMessages.ERR_OTP_EXPIRE,
    };
  }

  var timestamp = await libFunction.formatDateTimeLib(new Date());
  var changeLogId = await libFunction.driverLogDetailsLib({
    driverId: driverId,
    ipAddress: req.ip,
  });
  if (driverDetail.data[0].flag_verified == false) {
    await libFunction.InsertQuery("driver", "driver_id", driverId);
    var updateMobileFlag = await driverAuthDb.updateMobileNumberFlag(
      driverId,
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

  var updateOtpFlag = await driverAuthDb.updateOtpFlag(
    getLastOtp.data[0].otp_auth_id,
    changeLogId
  );

  if (updateOtpFlag.status == false) {
    return {
      status: false,
      error: constants.requestMessages.ERR_SOMTHIN_WENT_WRONG,
    };
  }
  var accessToken = await libAuth.createDriverAcessToken(driverId);
  var driverDetail = await getDriverProfileModule({
    driver_id: driverDetail.data[0].driver_id,
  });

  driverDetail.data["access_token"] = accessToken;
  return driverDetail;
};

module.exports = {
  createDriverProfileModule: createDriverProfileModule,
  getDriverProfileModule: getDriverProfileModule,
  sendOtpDriverModule: sendOtpDriverModule,
  loginOtpDriverModule: loginOtpDriverModule,
};
