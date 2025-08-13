const { body, validationResult } = require('express-validator');

// Validation middleware for items
const validateItem = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,()]+$/)
    .withMessage('Name contains invalid characters'),
  
  body('category')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category is required and must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Category contains invalid characters'),
  
  body('price')
    .isFloat({ min: 0, max: 999999.99 })
    .withMessage('Price must be a valid number between 0 and 999999.99'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

module.exports = {
  validateItem
};
