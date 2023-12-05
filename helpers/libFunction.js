// var constant = require("../public/document");
//Change Log
var fs = require("fs");
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

// const oAuth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URIS
// );
// oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// //Gmail API mailer
// async function sendMail(email, htmlFormate, subject, cc, bcc) {
//   try {
//     const ACCESS_TOKEN = await oAuth2Client.getAccessToken();
//     const transport = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAuth2",
//         user: "dhaval@acedataanalytics.com",
//         clientId: process.env.CLIENT_ID,
//         clientSecret: process.env.CLIENT_SECRET,
//         refreshToken: process.env.REFRESH_TOKEN,
//         accessToken: ACCESS_TOKEN,
//       },
//     });
//     const mailOptions = {
//       from: `"Dhaval" <dhaval@acedataanalytics.com>`,
//       to: email, //emailTo
//       subject: subject,
//       html: htmlFormate,
//     };

//     if (cc != undefined) {
//       mailOptions["cc"] = cc;
//     }

//     if (bcc != undefined) {
//       mailOptions["bcc"] = bcc;
//     }

//     try {
//       const result = await transport.sendMail(mailOptions);
//       console.log("Result:::::::::::::::::::::::::::::::::", result);
//       return result;
//     } catch (err) {
//       console.log("Error - 1 ::::::::::::::::::::::::::::::::::", err.message);
//       return {
//         status: false,
//         error: err.message,
//       };
//     }
//   } catch (err) {
//     console.log("Error - 2 ::::::::::::::::::::::::::::::::::::", err.message);
//     return {
//       status: false,
//       error: err.message,
//     };
//   }
// }

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
    const file = await fs.createWriteStream(filePath);

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
    console.log(error, "::::::::::::::::::::::::");
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
};
