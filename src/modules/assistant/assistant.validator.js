import { body } from 'express-validator';

export const chatValidator = [
  body('message').notEmpty().withMessage('message is required'),
  body('conversationId').optional().isUUID().withMessage('conversationId must be a valid UUID'),
];
