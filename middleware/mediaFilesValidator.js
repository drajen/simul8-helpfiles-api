const { body } = require("express-validator");

// Validation rules for Media File POST and PUT
const validateMediaFiles = [
  body("media_id")
    .notEmpty().withMessage("media_id is required")
    .isString().withMessage("media_id must be a string"),

  body("file_path")
    .notEmpty().withMessage("file_path is required")
    .isString().withMessage("file_path must be a string"),

  body("url")
    .notEmpty().withMessage("url is required")
    .isURL().withMessage("url must be a valid URL"),

  body("type")
    .notEmpty().withMessage("type is required")
    .isString().withMessage("type must be a string"),

  body("tags")
    .optional()
    .isArray().withMessage("tags must be an array of strings"),

  body("used_in_help_files")
    .optional()
    .isArray().withMessage("used_in_help_files must be an array")
];

module.exports = { validateMediaFiles };