import { body, query } from 'express-validator';

export const createSaleValidator = [
  body('id_article').isUUID().withMessage('id_article must be a UUID'),
  body('id_stockroom').isUUID().withMessage('id_stockroom must be a UUID'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be >= 1'),
  body('unit_price').optional().isDecimal(),
  body('sold_at').optional().isISO8601(),
  body('metadata').optional().isObject(),
];

export const listSalesValidator = [
  query('articleId').optional().isUUID(),
  query('stockroomId').optional().isUUID(),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 500 }),
  query('offset').optional().isInt({ min: 0 }),
];

export const createMovementValidator = [
  body('id_article').isUUID().withMessage('id_article must be a UUID'),
  body('id_stockroom').isUUID().withMessage('id_stockroom must be a UUID'),
  body('type').isIn(['IN', 'OUT', 'ADJUSTMENT']),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be >= 1'),
  body('reference').optional().isString(),
  body('moved_at').optional().isISO8601(),
  body('metadata').optional().isObject(),
];

export const listMovementsValidator = [
  query('articleId').optional().isUUID(),
  query('stockroomId').optional().isUUID(),
  query('type').optional().isIn(['IN', 'OUT', 'ADJUSTMENT']),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 500 }),
  query('offset').optional().isInt({ min: 0 }),
];
