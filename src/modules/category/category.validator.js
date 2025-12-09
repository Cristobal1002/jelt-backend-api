import { body, query } from 'express-validator';

export const createCategoryValidator = [
  body('name').notEmpty().withMessage('name is required'),
    body('isActive').optional().isBoolean()
];

export const updateCategoryValidator = [
  body('name').optional(),
  body('isActive').optional().isBoolean(),
];

export const listCategoryValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('perPage').optional().isInt({ min: 1, max: 100 }),
];
