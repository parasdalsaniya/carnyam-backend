const storageModule = require("./storage.module");

const uploadFileController = async (req, res) => {
  let reqBody = req.body;
  reqBody.ip = req.ip;
  reqBody.file = req.file;
  reqBody["user_id"] = req.user_id;

  const result = await storageModule.uploadFileModule(reqBody);
  return res.send(result);
};

const uploadProfileController = async (req, res) => {
  let reqBody = req.body;
  reqBody.file = req.file;

  const result = await storageModule.uploadPublicFileModule(reqBody);
  return res.send(result);
};

const getFileController = async (req, res) => {
  let reqBody = req.body;
  reqBody.query = req.query;
  reqBody.ip = req.ip;

  const result = await storageModule.getFileModule(reqBody);
  if (result.status == true) {
    if (req.query.flag_info == "false") {
      res.sendFile(result.data);
    } else {
      return res.send(result);
    }
  } else {
    return res.send(result);
  }
};

const deleteFileController = async (req, res) => {
  let reqBody = req.body;
  reqBody.query = req.query;
  reqBody.ip = req.ip;

  const result = await storageModule.deleteFileModule(reqBody);
  return res.send(result);
};

module.exports = {
  uploadFileController,
  uploadProfileController,
  getFileController,
  deleteFileController,
};
