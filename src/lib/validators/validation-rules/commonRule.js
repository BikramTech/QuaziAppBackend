const { check } = require("express-validator");

const email = check("email")
  .isEmail()
  .withMessage("Enter a valid email address");

const password = check("password")
  .not()
  .isEmpty()
  .isLength({ min: 6 })
  .withMessage("Must be at least 6 chars long");

module.exports = { email, password };
