import { Router } from 'express';
import { articleController } from './article.controller.js';
import {
  createArticleValidator,
  updateArticleValidator,
  listArticleValidator,
} from './article.validator.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate-request.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  createArticleValidator,
  validateRequest,
  articleController.create
);

router.get(
  '/',
  listArticleValidator,
  validateRequest,
  articleController.list
);

router.get('/:id', articleController.getById);

router.put(
  '/:id',
  updateArticleValidator,
  validateRequest,
  articleController.update
);

router.delete('/:id', articleController.softDelete);

export default router;
