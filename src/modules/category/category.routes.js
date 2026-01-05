import { Router } from 'express';
import { categoryController } from './category.controller.js';
import {
  listCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
} from './category.validator.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate-request.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createCategoryValidator, validateRequest, categoryController.create);

router.get('/', listCategoryValidator, validateRequest, categoryController.list);

router.get('/:id', categoryController.getById);

router.put('/:id', updateCategoryValidator, validateRequest, categoryController.update);

export default router;
