const path = require("path");
const dotenv = require("dotenv");
const LibFunction = require("../../../helpers/libFunction");
const constant = require("../../../helpers/consts");
const libStorage = require("../../../helpers/libStorage");
const storageDb = require("./storage.db");

dotenv.config();
const BUCKET_DIR = {
  CHATBOT: process.env.CHATBOT_BUCKET_DIR,
  PERSONA: process.env.PERSONA_BUCKET_DIR,
  EXTENSION: process.env.EXTENSION_BUCKET_DIR,
  TEMPLATE: process.env.TEMPLATE_BUCKET_DIR,
  BANNER: process.env.BANNER_BUCKET_DIR,
  CATEGORY: process.env.CATEGORY_BUCKET_DIR,
  GENERAL: process.env.GENERAL_BUCKET_DIR,
};
const GOOGLE_STORAGE_CUSTOM_BASE_URL =
  process.env.GOOGLE_STORAGE_CUSTOM_BASE_URL;

function errorMessage(params) {
  return {
    status: false,
    error: params != undefined ? params : constant.requestMessages.ERR_GENERAL,
  };
}

const uploadFileModule = async (body) => {
  try {
    // const userData = req.user_id;
    const userId = body.user_id;
    if (userId == undefined) {
      return errorMessage();
    }

    let file = body.file;
    let fileType = path.extname(file.originalname);
    let fileSize = file.size;
    let filePath = path.join(__dirname, `../../../${file.path}`);
    let originalFileName = file.originalname;
    let newFileName = file.filename;
    let flagPublic = false;

    let bucketPath = "files";
    let destiPath = `files/${newFileName}`;

    const obj = {
      userId: userId,
      ipAddress: body.ip,
    };

    const changeLogId = await LibFunction.changeLogDetailsLib(obj);

    let fileUpload = await libStorage.googleFileUpload(
      filePath,
      destiPath,
      originalFileName,
      newFileName,
      fileSize,
      fileType,
      flagPublic,
      false,
      userId,
      changeLogId
    );

    const deleteFile = await libStorage.FileDelete(filePath);
    if (deleteFile.status == false) {
      return errorMessage(constant.requestMessages.ERR_WHILE_UPLODING_FILE);
    }

    if (fileUpload.status == false) {
      return errorMessage(constant.requestMessages.ERR_WHILE_UPLODING_FILE);
    }

    const data = {
      google_storage_id: fileUpload.data.google_storage_id,
      original_file_name: fileUpload.data.google_storage_original_file_name,
      storage_bucket_id: fileUpload.data.google_storage_original_file_id,
      self_link: fileUpload.data.google_storage_file_self_link,
      file_name: fileUpload.data.google_storage_file_name,
      file_size: fileUpload.data.goolge_storage_file_size,
      uploaded_at: fileUpload.data.timestamp,
      flag_deleted: fileUpload.data.flag_deleted,
      flag_public: fileUpload.data.google_storage_flag_public,
      user_id: fileUpload.data.user_id,
    };

    return {
      status: true,
      data: data,
    };
  } catch (err) {
    console.log(err);
    return {
      status: false,
      error: err.message,
    };
  }
};

const uploadPublicFileModule = async (body) => {
  try {
    let file = body.file;
    let filePath = path.join(__dirname, `../../../../${file.path}`);
    let newFileName = file.filename;

    let bucketPath;
    if (body.extention_flag === true || body.extention_flag === "true") {
      bucketPath = "EXTENSION";
    } else if (body.template_flag === true || body.template_flag === "true") {
      bucketPath = "TEMPLATE";
    } else if (body.banner_flag === true || body.banner_flag === "true") {
      bucketPath = "BANNER";
    } else if (body.category_flag === true || body.category_flag === "true") {
      bucketPath = "CATEGORY";
    } else if (body.persona_flag === true || body.persona_flag === "true") {
      bucketPath = "PERSONA";
    } else if (body.general_flag === true || body.general_flag === "true") {
      bucketPath = "GENERAL";
    } else {
      return {
        status: false,
        error: constant.requestMessages.ERR_INVALID_BODY,
      };
    }

    let destiPath = `${BUCKET_DIR[bucketPath]}/${newFileName}`;
    let fileUpload = await libStorage.uploadGoogleFileToPublicBucket(
      filePath,
      destiPath
    );

    const deleteFile = await libStorage.FileDelete(filePath);
    if (deleteFile.status == false) {
      return errorMessage(constant.requestMessages.ERR_WHILE_UPLODING_FILE);
    }

    if (fileUpload.status == false) {
      return errorMessage(constant.requestMessages.ERR_WHILE_UPLODING_FILE);
    }

    return {
      status: true,
      data: {
        file_path: GOOGLE_STORAGE_CUSTOM_BASE_URL + fileUpload.data,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      status: false,
      error: err.message,
    };
  }
};

const getFileModule = async (body) => {
  try {
    let fileID = body.query.file_id;
    let flagInfo = body.query.flag_info;
    // return await pdfExtractor.pdfToJsonExtractor(8)
    if (
      fileID == "" ||
      fileID == undefined ||
      flagInfo == "" ||
      flagInfo == undefined
    ) {
      return {
        status: false,
        error: constant.requestMessages.ERR_INVALID_BODY,
      };
    }

    const googleStorage = await storageDb.getPrivateGoogleStorageFile(fileID);
    if (googleStorage.status == false || googleStorage.data.length == 0) {
      return errorMessage(constant.requestMessages.ERR_BAD_REQUEST);
    }

    if (flagInfo == "true") {
      const data = {
        google_storage_id: googleStorage.data[0].google_storage_id,
        original_file_name:
          googleStorage.data[0].google_storage_original_file_name,
        storage_bucket_id:
          googleStorage.data[0].google_storage_original_file_id,
        self_link: googleStorage.data[0].google_storage_file_self_link,
        file_name: googleStorage.data[0].google_storage_file_name,
        uploaded_at: googleStorage.data[0].timestamp,
        flag_deleted: googleStorage.data[0].google_storage_flag_deleted,
        flag_public: googleStorage.data[0].google_storage_flag_public,
        user_id: googleStorage.data[0].user_id,
        file_size: googleStorage.data[0].goolge_storage_file_size,
      };

      return {
        status: true,
        data: data,
      };
    } else if (flagInfo == "false") {
      const googleStorageDownload = await libStorage.googleFileDownload(
        googleStorage.data[0].google_storage_file_name
      );
      if (googleStorageDownload.status == false) {
        return {
          status: false,
          error: constant.requestMessages.ERR_DOWNLOAD_FILE_FROM_GOOGLE,
        };
      }

      const imageBasename = path.basename(
        googleStorage.data[0].google_storage_file_name
      );
      const data = path.join(
        __dirname,
        `../../../public/assets/${imageBasename}`
      );
      console.log(data);
      return {
        status: true,
        data: data,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      status: false,
      error: err.message,
    };
  }
};

const deleteFileModule = async (body) => {
  try {
    let fileId = body.query.file_id;
    let userId = body.user_id;
    if (fileId == undefined || fileId == null || fileId == "") {
      return errorMessage(constant.requestMessages.ERR_INVALID_BODY);
    }

    const googleStorage = await storageDb.getPrivateGoogleStorageFile(fileId);
    if (googleStorage.status == false || googleStorage.data.length == 0) {
      return errorMessage(constant.requestMessages.ERR_BAD_REQUEST);
    }

    if (googleStorage.data[0].user_id != userId) {
      return errorMessage(constant.requestMessages.ERR_ACCESS_NOT_GRANTED);
    }
    let changeLogId;
    if (googleStorage.data[0].flag_saved == true) {
      const obj = {
        userId: userId,
        ipAddress: body.ip,
      };

      changeLogId = await LibFunction.changeLogDetailsLib(obj);
    } else {
      changeLogId = undefined;
    }
    let deleteFile = await libStorage.deleteGoogleFile(
      fileId,
      userId,
      googleStorage.data[0],
      changeLogId
    );

    if (deleteFile.status == false) {
      return errorMessage(constant.requestMessages.ERR_DELETE_FILE_FROM_GOOGLE);
    }

    return {
      status: true,
      data: "File deleted successfully",
    };
  } catch (err) {
    console.log(err);
    return {
      status: false,
      error: err.message,
    };
  }
};

module.exports = {
  uploadFileModule,
  uploadPublicFileModule,
  getFileModule,
  deleteFileModule,
};
