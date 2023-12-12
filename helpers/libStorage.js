const dotenv = require("dotenv");
const crud = require("../routes/crud");
const libfunction = require("./libFunction");
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const fs = require("fs");
dotenv.config();

// Upload File To Google Cloud Private Bucket
const googleFileUpload = async (
  filePath,
  destiPath,
  originalFileName,
  newFileName,
  fileSize,
  fileType,
  flagPublic,
  flagSaved,
  userId,
  changeLogId
) => {
  try {
    const timestamp = await libfunction.formatDateLib(new Date());
    const bucketName = process.env.GOOGLE_STORAGE_BUCKET;
    const storage = new Storage({
      keyFilename: path.join(
        __dirname,
        `../braided-trees-406905-56cbf0b82016.json`
      ),
      projectId: "carnyam",
    });

    const upload_file = await storage.bucket(bucketName).upload(filePath, {
      destination: destiPath,
    });
    var fileObject = JSON.stringify(upload_file[0].metadata).replace(/"/g, "");

    var createGoogleStorage =
      await crud.executeQuery(`INSERT INTO google_storage(
        user_id, google_storage_original_file_name, google_storage_original_file_id, google_storage_file_self_link, google_storage_file_name, google_storage_object, google_storage_flag_public, goolge_storage_file_size, goolge_storage_file_type, "timestamp", flag_deleted,added_by_change_log_id,flag_saved)
        VALUES ('${userId}','${originalFileName}','${upload_file[0].metadata.id}','${upload_file[0].metadata.selfLink}','${upload_file[0].metadata.name}','${fileObject}','${flagPublic}','${fileSize}','${fileType}','${timestamp}','false','${changeLogId}','${flagSaved}') returning *`);

    if (createGoogleStorage.status == false) {
      return {
        status: false,
      };
    }

    return {
      status: true,
      data: createGoogleStorage.data[0],
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      error: e.message,
    };
  }
};

// Upload File To Google Cloud Public Bucket
const uploadGoogleFileToPublicBucket = async (filePath, destPath) => {
  try {
    const timestamp = await libfunction.formatDateLib(new Date());
    const bucketName = process.env.GOOGLE_STORAGE_PUBLIC_BUCKET;
    const storage = new Storage({
      keyFilename: path.join(
        __dirname,
        `../${process.env.GOOGLE_STORAGE_SERVICE_ACC}`
      ),
      projectId: "carnyam",
    });
    const upload_file = await storage.bucket(bucketName).upload(filePath, {
      destination: destPath,
    });

    var fileObject = JSON.stringify(upload_file[0].metadata).replace(/"/g, "");
    if (upload_file.error) {
      return {
        status: false,
      };
    }

    return {
      status: true,
      data: upload_file[0].metadata.name,
    };
  } catch (e) {
    console.log(e);
    return { status: false, error: e.message };
  }
};

const googleFileDownload = async (fileName, originalFileName) => {
  try {
    if (!originalFileName) {
      originalFileName = fileName;
    }
    const bucketName = process.env.GOOGLE_STORAGE_BUCKET;
    const createFolder = path.join(__dirname, `../public/assets`);
    if (!fs.existsSync(createFolder)) {
      fs.mkdirSync(createFolder);
      console.log(`Folder "${createFolder}" created.`);
    }
    const destFileName = path.join(
      __dirname,
      `../public/assets/${path.basename(originalFileName)}`
    );

    const storage = new Storage({
      keyFilename: path.join(
        __dirname,
        `../${process.env.GOOGLE_STORAGE_SERVICE_ACC}`
      ),
      projectId: "carnyam",
    });

    const options = {
      destination: destFileName,
    };
    await storage.bucket(bucketName).file(fileName).download(options);
    return { status: true, data: destFileName };
  } catch (e) {
    return { status: false, error: e };
  }
};

const deleteGoogleFile = async (fileId, userId, googleStorage, changeLogId) => {
  try {
    var timestamp = await libfunction.formatDateLib(new Date());
    if (googleStorage.flag_saved == false) {
      var deletePublicFile = await crud.executeQuery(
        `DELETE FROM google_storage WHERE google_storage_id IN ('${fileId}')`
      );
      if (deletePublicFile.status == false) {
        return { status: false };
      }
      var deleteFileFromStorage = await deleteFileFromGoogleStorage(
        googleStorage.google_storage_file_name
      );
      if (deleteFileFromStorage.status == false) {
        return { status: false };
      }
      return { status: true };
    } else {
      var generateHistory = await libfunction.InsertQuery(
        "google_storage",
        "google_storage_id",
        fileId
      );
      if (generateHistory.status != true) {
        return { status: false };
      }
      var updateFile = await crud.executeQuery(`
            UPDATE google_storage
            SET flag_deleted = 'true', timestamp = '${timestamp}', added_by_change_log_id = '${changeLogId}'
            WHERE google_storage_id = '${fileId}'
        `);
      if (updateFile.status == false) {
        return { status: false };
      }
      return { status: true };
    }
  } catch (err) {
    return {
      status: false,
      error: err.message,
    };
  }
};

const deleteFileFromGoogleStorage = async (fileName) => {
  try {
    const bucketName = process.env.GOOGLE_STORAGE_BUCKET;

    const storage = new Storage({
      keyFilename: path.join(
        __dirname,
        `../${process.env.GOOGLE_STORAGE_SERVICE_ACC}`
      ),
      projectId: "carnyam",
    });

    await storage.bucket(bucketName).file(fileName).delete();
    return { status: true };
  } catch (e) {
    console.log(e);
    return { status: false, error: e.message };
  }
};

//Delete file From Local Storage
const FileDelete = async (filePath) => {
  try {
    fs.unlinkSync(filePath);
    return { status: true };
  } catch (e) {
    return { status: false, error: e };
  }
};

//Update Flag Saved
const updateFlagSaved = async (storageId) => {
  try {
    var sql = `UPDATE google_storage SET flag_saved = true WHERE google_storage_id IN ('${storageId}')`;
    var result = await crud.executeQuery(sql);
    return result;
  } catch (err) {
    return {
      status: false,
      error: err.message,
    };
  }
};

const updateFlagSavedAndPublic = async (storageId, flagPublic) => {
  var sql = `UPDATE google_storage SET flag_saved = true,google_storage_flag_public = true WHERE google_storage_id IN ('${storageId}')`;
  var result = await crud.executeQuery(sql);
  return result;
};

module.exports = {
  googleFileUpload,
  uploadGoogleFileToPublicBucket,
  googleFileDownload,
  deleteGoogleFile,
  deleteFileFromGoogleStorage,
  FileDelete,
  updateFlagSaved,
  updateFlagSavedAndPublic,
};
