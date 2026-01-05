import { Router } from 'express';
import { inventoryHistoryController } from './inventory-history.controller.js';
import {
  createSaleValidator,
  listSalesValidator,
  createMovementValidator,
  listMovementsValidator,
} from './inventory-history.validator.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate-request.middleware.js';

const router = Router();

router.use(authMiddleware);

 router.post(
  '/sales',
  createSaleValidator,
  validateRequest,
  inventoryHistoryController.createSale
);

router.get(
  '/sales',
  listSalesValidator,
  validateRequest,
  inventoryHistoryController.listSales
);

router.get(
  '/sales/summary',
  listSalesValidator,
  validateRequest,
  inventoryHistoryController.salesSummary
);

router.get(
  '/sales/top',
  listSalesValidator,
  validateRequest,
  inventoryHistoryController.topSelling
);


router.post(
  '/movements',
  createMovementValidator,
  validateRequest,
  inventoryHistoryController.createMovement
);

router.get(
  '/movements',
  listMovementsValidator,
  validateRequest,
  inventoryHistoryController.listMovements
);

router.get(
  '/movements/summary',
  listMovementsValidator,
  validateRequest,
  inventoryHistoryController.movementSummary
);

export default router;