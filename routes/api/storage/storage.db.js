const crud = require("../../crud");

const getPrivateGoogleStorageFile = async (fileId) => {
  var sql = `select * from google_storage where flag_deleted = false and history_id is null and google_storage_id in ('${fileId}')`;
  var result = await crud.executeQuery(sql);
  return result;
};

module.exports = {
  getPrivateGoogleStorageFile: getPrivateGoogleStorageFile,
};
