const multer = require("multer");
const config = require("config");
const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");
const upload_path = config.UPLOAD_PATH || "./uploads";

if (!fs.existsSync(upload_path)) {
  fs.mkdirSync(upload_path);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, upload_path);
  },
  filename: (req, file, cb) => {
    cb(null, nanoid() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1000000,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Invalid file type");
      error.code = "INVALID_FILE_TYPE";
      return cb(error, false);
    }

    cb(null, true);
  },
});

const deleteImage = (path) => {
  fs.unlinkSync(`./${path}`, (err) => {
    if (err) throw err;
  });
};

module.exports = { upload, deleteImage };
