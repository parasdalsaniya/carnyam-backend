const express = require("express");
const router = express.Router();
const storageController = require("./storage.controller");
const multer = require("multer");
const path = require("path");
const middleware = require("../../middleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    const date = new Date();
    var picName = `${
      path.parse(file.originalname.split(" ").join("_")).name
    }_${date.getTime()}${path.parse(file.originalname).ext}`;
    cb(null, picName);
  },
});
const upload = multer({ storage: storage });

router.post(
  "/file",
  middleware.checkAccessToken,
  upload.single("file"),
  storageController.uploadFileController
);
router.post(
  "/upload-file",
  middleware.checkAccessToken,
  upload.single("file"),
  storageController.uploadProfileController
);
router.get(
  "/file",
  middleware.checkAccessToken,
  storageController.getFileController
);
router.delete(
  "/file",
  middleware.checkAccessToken,
  storageController.deleteFileController
);

module.exports = router;
