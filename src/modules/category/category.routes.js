import { Router } from 'express';
import { categoryController } from './category.controller.js';
import {
  listCategoryValidator,
} from './category.validator.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate-request.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listCategoryValidator, validateRequest, categoryController.list);

router.get('/:id', categoryController.getById);

export default router;
