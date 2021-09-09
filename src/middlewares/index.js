const Authorize = require("./authenticate");
const JwtStrategy = require("./jwtStrategy");
const ValidateModel = require("./validate");
const DocUpload = require("./docUpload");

module.exports = {
  Authorize,
  JwtStrategy,
  ValidateModel,
  DocUpload
};
