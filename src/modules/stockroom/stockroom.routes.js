import { Router } from 'express';
import { stockroomController } from './stockroom.controller.js';
import {
  createStockroomValidator,
  updateStockroomValidator,
  listStockroomValidator,
} from './stockroom.validator.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate-request.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createStockroomValidator, validateRequest, stockroomController.create);

router.get('/', listStockroomValidator, validateRequest, stockroomController.list);

router.get('/:id', stockroomController.getById);

router.put('/:id', updateStockroomValidator, validateRequest, stockroomController.update);

export default router;
