import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Password mínimo 6 caracteres'),
  body('name').notEmpty().withMessage('Nombre requerido'),
];

export const loginValidator = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

export const updateValidator = [
  body('name').optional(),
  body('phone').optional(),
  body('address').optional(),
];
