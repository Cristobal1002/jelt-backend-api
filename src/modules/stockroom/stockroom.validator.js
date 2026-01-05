import { body, query } from 'express-validator';
import { STOCK_MOVEMENT_TYPES_VALUES } from '../../constants/stock-movement-types.js';

export const createStockMovementValidator = [
  body('type')
    .isIn(STOCK_MOVEMENT_TYPES_VALUES)
    .withMessage(`type must be one of: ${STOCK_MOVEMENT_TYPES_VALUES.join(', ')}`),

  body('quantity').isInt({ min: 1 }),
  body('id_article').isInt(),
];

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
