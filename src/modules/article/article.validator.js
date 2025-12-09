import { body, query } from 'express-validator';

export const createArticleValidator = [
  body('sku').notEmpty().withMessage('sku is required'),
  body('name').notEmpty().withMessage('name is required'),
  body('id_category').isUUID().withMessage('id_category must be UUID'),
  body('id_supplier').isUUID().withMessage('id_supplier must be UUID'),
  body('id_stockroom').isUUID().withMessage('id_stockroom must be UUID'),
  body('unit_price').isFloat({ gt: 0 }).withMessage('unit_price must be > 0'),
  body('unit_cost').isFloat({ gt: 0 }).withMessage('unit_cost must be > 0'),
  body('stock').optional().isInt().withMessage('stock must be integer'),
];

export const updateArticleValidator = [
  body('sku').optional(),
  body('name').optional(),
  body('id_category').optional().isUUID(),
  body('id_supplier').optional().isUUID(),
  body('id_stockroom').optional().isUUID(),
  body('unit_price').optional().isFloat({ gt: 0 }),
  body('unit_cost').optional().isFloat({ gt: 0 }),
  body('stock').optional().isInt(),
  body('reorder_point').optional().isInt(),
  body('lead_time').optional().isInt(),
  body('isActive').optional().isBoolean(),
];

export const listArticleValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('perPage').optional().isInt({ min: 1, max: 100 }),
  query('priceGt').optional().isFloat(),
  query('priceLt').optional().isFloat(),
  query('priceMin').optional().isFloat(),
  query('priceMax').optional().isFloat(),
];
