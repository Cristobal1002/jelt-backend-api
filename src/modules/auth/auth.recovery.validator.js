import { body } from 'express-validator';

export const recoveryRequestValidator = [
  body('email').isEmail().withMessage('Email inválido'),
];

export const tempLoginValidator = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .isString()
    .trim()
    .isLength({ min: 4, max: 12 })
    .withMessage('Password Temporal inválido'),
];
