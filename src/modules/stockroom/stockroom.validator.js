import { body, query } from 'express-validator';

export const createStockroomValidator = [
  body('name').notEmpty().withMessage('name is required')
];

export const updateStockroomValidator = [
  body('name').optional(),
  body('isActive').optional().isBoolean(),
];

export const listStockroomValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('perPage').optional().isInt({ min: 1, max: 100 }),
];
