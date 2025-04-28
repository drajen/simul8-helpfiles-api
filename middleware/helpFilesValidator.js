// /middleware/validators/helpFileValidator.js
const { body } = require('express-validator');

// Validation rules for creating or updating a Help File
const helpFilesValidationRules = [
  body('document_id')
    .notEmpty().withMessage('document_id is required')
    .isString().withMessage('document_id must be a string'),

  body('title')
    .notEmpty().withMessage('title is required')
    .isString().withMessage('title must be a string'),

  body('categories')
    .isArray().withMessage('categories must be an array'),

  body('content_sections')
    .optional()
    .isArray().withMessage('content_sections must be an array'),

  body('tags')
    .optional()
    .isArray().withMessage('tags must be an array'),

  body('references')
    .optional()
    .isArray().withMessage('references must be an array'),
];

module.exports = {
  helpFilesValidationRules
};