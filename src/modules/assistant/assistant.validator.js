import { body } from 'express-validator';

export const chatValidator = [
  body('message').notEmpty().withMessage('message is required'),
];
