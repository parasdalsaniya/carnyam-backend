var constant = require("../helpers/consts");
//Change Log
var fs = require("fs");
var { google } = require("googleapis");
const https = require("https");
const dotenv = require("dotenv").config();
var nodemailer = require("nodemailer");
var crud = require("../routes/crud");
const { constants } = require("buffer");
//Crete Access token
async function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  console.log(result);
  return result;
}

//Format Date And Time
const formatDateTimeLib = async (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear(),
    hour = "" + d.getHours(),
    minute = "" + d.getMinutes(),
    second = "" + d.getSeconds();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  if (hour.length < 2) hour = "0" + hour;
  if (minute.length < 2) minute = "0" + minute;
  if (second.length < 2) second = "0" + second;

  var str = [year, month, day].join("-");
  return str + " " + hour + ":" + minute + ":" + second;
};

//Format Date
const formatDateLib = async (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear(),
    hour = "" + d.getHours(),
    minute = "" + d.getMinutes(),
    second = "" + d.getSeconds();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  if (hour.length < 2) hour = "0" + hour;
  if (minute.length < 2) minute = "0" + minute;
  if (second.length < 2) second = "0" + second;

  var str = [year, month, day].join("-");
  return str;
};

//Expiry Time 'expiry_minute_time' In Minute
async function expiryTime(expiry_minute_time) {
  let expiry_time = new Date(
    new Date().getTime() + expiry_minute_time * 1440000
  );
  let expiry_time_string = await formatDateTimeLib(expiry_time);
  return expiry_time_string;
}

//Gmail API mailer
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
async function sendMail(email, htmlFormate, subject, cc, bcc) {
  try {
    // await sleep(3000);
    const ACCESS_TOKEN = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "info.cypersoft@gmail.com",
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: ACCESS_TOKEN,
      },
    });
    const mailOptions = {
      from: `"Cypers" <info.cypersoft@gmail.com>`,
      to: email, //emailTo
      subject: subject,
      html: htmlFormate,
    };

    if (cc != undefined) {
      mailOptions["cc"] = cc;
    }

    if (bcc != undefined) {
      mailOptions["bcc"] = bcc;
    }

    try {
      const result = await transport.sendMail(mailOptions);
      console.log("Result:::::::::::::::::::::::::::::::::", result);
      return result;
    } catch (err) {
      console.log("Error - 1 ::::::::::::::::::::::::::::::::::", err.message);
      return {
        status: false,
        error: err.message,
      };
    }
  } catch (err) {
    console.log("Error - 2 ::::::::::::::::::::::::::::::::::::", err.message);
    return {
      status: false,
      error: err.message,
    };
  }
}
// check recaptcha
async function recaptcha(reCaptchaCode) {
  var recaptchaReq = sync_request(
    "POST",
    `${process.env.RECAPTCHA_AUTH_URL}?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${reCaptchaCode}`
  );

  if (recaptchaReq.statusCode == 400) {
    return {
      status: false,
      error: constant.requestMessages.ERR_BAD_REQUEST,
    };
  }
  var recaptchaData = JSON.parse(recaptchaReq.getBody("utf8"));
  return recaptchaData;
}

const downloadImage = async (imageUrl, filePath) => {
  try {
    const file = fs.createWriteStream(filePath);

    const response = await new Promise((resolve, reject) => {
      https.get(imageUrl, resolve).on("error", reject);
    });

    await response.pipe(file);

    await new Promise((resolve, reject) => {
      file.on("finish", resolve);
      file.on("error", reject);
    });
    return {
      status: true,
      data: filePath,
    };
  } catch (error) {
    return {
      status: false,
      data: error,
    };
  }
};

async function generateOTP(length) {
  var result = "";
  var characters = "1234567890";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  console.log(result);
  return result;
}
async function expiryTimeInMin(minute) {
  let expiry_time_in_min = new Date(new Date().getTime() + 1000 * 60 * minute);
  let expiry_time_string = await formatDateTimeLib(expiry_time_in_min);
  return expiry_time_string;
}

const getExpireTimeStamp = async (flag) => {
  if (flag) {
    var expireTimeStamp = new Date(
      new Date().getTime() + 24 * 60 * 60 * 1000 * 30
    );
  } else {
    var expireTimeStamp = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  }

  return expireTimeStamp;
};

async function trimValues(item) {
  if (typeof item === "string") {
    return item.replace(/'/g, "''").trim();
  } else if (typeof item === "object" && item !== null) {
    if (Array.isArray(item)) {
      // If the item is an array, recursively call trimValues for each element
      return item.map(trimValues);
    } else {
      // If the item is an object, recursively call trimValues for each value
      for (let key in item) {
        if (item.hasOwnProperty(key)) {
          item[key] = trimValues(item[key]);
        }
      }
      return item;
    }
  }
  // For other data types, return as is
  return item;
}

const changeLogDetailsLib = async (obj) => {
  console.log(obj);
  const date = new Date();
  var fieldArr = [
    {
      field: "ip_address",
      value:
        obj.ipAddress == undefined ||
        obj.ipAddress == null ||
        obj.ipAddress == ""
          ? "Google Sign In"
          : obj.ipAddress,
    },
    { field: "timestamp", value: await formatDateTimeLib(date) },
    { field: "user_id", value: obj.userId },
  ];

  if (obj.companyId)
    fieldArr.push({ field: "company_id", value: obj.companyId });
  const changeLogDetails = await crud.executeQuery(
    crud.makeInsertQueryString(
      "change_log",
      fieldArr,
      ["change_log_id", "timestamp"],
      false
    )
  );

  if (!changeLogDetails.status) {
    return {
      status: false,
      error: constant.requestMessages.ERR_WHILE_EXCUTING_MYSQL_QUERY,
    };
  }
  return changeLogDetails.data[0].change_log_id;
};

const InsertQuery = async (table_name, coulmn_name, value) => {
  var sql = `select * from ${table_name} where ${coulmn_name} ='${value}'`;
  var categoryData = await crud.executeQuery(sql);
  if (categoryData.status == false || categoryData.data.length == 0) {
    return { status: false };
  }
  var keys = Object.keys(categoryData.data[0]);
  var index = keys.indexOf(coulmn_name);
  keys.splice(index, 1);
  var sql2 = `insert into ${table_name} (${keys.join(",")})
    SELECT ${keys.join(",")} 
    FROM ${table_name} where ${coulmn_name}='${value}' returning *;`;
  var insertedData = await crud.executeQuery(sql2);
  await crud.executeQuery(
    `update ${table_name} set history_id='${value}' where ${coulmn_name}='${insertedData.data[0][coulmn_name]}';`
  );
  return { status: insertedData.status };
};

async function sleep(delay) {
  var start = new Date().getTime();
  while (new Date().getTime() < start + delay);
}

const driverLogDetailsLib = async (obj) => {
  console.log(obj);
  const date = new Date();
  var fieldArr = [
    {
      field: "ip_address",
      value:
        obj.ipAddress == undefined ||
        obj.ipAddress == null ||
        obj.ipAddress == ""
          ? "Google Sign In"
          : obj.ipAddress,
    },
    { field: "timestamp", value: await formatDateTimeLib(date) },
    { field: "driver_id", value: obj.driverId },
  ];

  if (obj.companyId)
    fieldArr.push({ field: "company_id", value: obj.companyId });
  const changeLogDetails = await crud.makeInsertQueryString(
    "driver_log",
    fieldArr,
    ["driver_log_id", "timestamp"],
    false
  );

  if (!changeLogDetails.status) {
    return {
      status: false,
      error: "Error",
    };
  }
  return changeLogDetails.data[0].driver_log_id;
};

const objValidator = async (array) => {
  var result =
    array
      .map((x) => {
        if (typeof x == "boolean") {
          if (x == undefined) {
            return true;
          }
        } else {
          if (x == undefined || x == null || x == "") {
            return true;
          }
        }
      })
      .filter((x) => x == true).length != 0
      ? false
      : true;
  return result;
};

module.exports = {
  makeid: makeid,
  formatDateLib: formatDateLib,
  formatDateTimeLib: formatDateTimeLib,
  generateOTP: generateOTP,
  expiryTime: expiryTime,
  recaptcha: recaptcha,
  downloadImage: downloadImage,
  expiryTimeInMin: expiryTimeInMin,
  getExpireTimeStamp: getExpireTimeStamp,
  trimValues: trimValues,
  sendMail: sendMail,
  changeLogDetailsLib: changeLogDetailsLib,
  InsertQuery: InsertQuery,
  driverLogDetailsLib: driverLogDetailsLib,
  objValidator: objValidator,
};
