const multer = require("multer");
var fs = require('fs');

const storage = multer.diskStorage({
  destination: async (req, file, callback) => {
    if (file.fieldname === "profile_pic") {

      const imageFilePath = `${global.__baseDirectory}/uploads/images`;

      if (!fs.existsSync(imageFilePath)) {

        fs.mkdir(imageFilePath, { recursive: true }, (err) => {
          if (err) {
            return console.error(err);
          }
          callback(null, './uploads/images');
        });
      }
      else {
        callback(null, './uploads/images');
      }


    } else if (file.fieldname === "resume_file") {

      const resumeFilePath = `${global.__baseDirectory}/uploads/resumes`;

      if (!fs.existsSync(resumeFilePath)) {

        fs.mkdir(resumeFilePath, { recursive: true }, (err) => {
          if (err) {
            return console.error(err);
          }
          callback(null, './uploads/resumes');
        });
      }
      else {
        callback(null, './uploads/resumes');
      }
    }
  },

  filename: function (req, file, callback) {
    callback(null, Date.parse(new Date()) + file.originalname);
  },
});
let errorMsg = {
  message: "file type not supported",
};

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msexcel" ||
    file.mimetype === "application/xslx" ||
    file.mimetype === "application/docx" ||
    file.mimetype === "application/doc" ||
    file.mimetype === "application/msword" ||
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

  ) {
    callback(null, true);
  } else {
    errorMsg.message = "file type not supported -" + file.mimetype;
    callback(errorMsg, false);
  }
};
const docsUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 100,
  },
  fileFilter: fileFilter,
});

module.exports = docsUpload;
