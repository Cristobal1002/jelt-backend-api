import { body, query } from 'express-validator';

export const createSupplierValidator = [
  body('name').notEmpty().withMessage('name is required'),
  body('nit').notEmpty().withMessage('nit is required'),
];

export const updateSupplierValidator = [
  body('name').optional(),
  body('nit').optional(),
  body('address').optional(),
  body('phone').optional(),
  body('isActive').optional().isBoolean(),
];

export const listSupplierValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('perPage').optional().isInt({ min: 1, max: 100 }),
];
