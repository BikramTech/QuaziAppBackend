const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if (file.fieldname === "image") {
      callback(null, "./uploads/images");
    } else if (file.fieldname === "resume") {
      callback(null, "./uploads/resumes");
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
    file.mimetype === "application/pdf"||
    file.mimetype === "application/msexcel" ||
    file.mimetype === "application/xslx" ||
    file.mimetype === "application/docx" ||
    file.mimetype === "application/doc" ||
    file.mimetype === "application/msword" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
