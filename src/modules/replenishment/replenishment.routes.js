import { Router } from 'express';
import { replenishmentController } from './replenishment.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();


router.get(
  '/articles/:articleId',
  authMiddleware,
  replenishmentController.getByArticleId
);

router.get(
  '/articles/by-sku/:sku',
  authMiddleware,
  replenishmentController.getBySku
);

export default router;
