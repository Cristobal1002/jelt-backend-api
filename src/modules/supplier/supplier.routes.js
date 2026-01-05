import { Router } from 'express';
import { supplierController } from './supplier.controller.js';
import {
  createSupplierValidator,
  updateSupplierValidator,
  listSupplierValidator,
} from './supplier.validator.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate-request.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createSupplierValidator, validateRequest, supplierController.create);

router.get('/', listSupplierValidator, validateRequest, supplierController.list);

router.get('/:id', supplierController.getById);

router.put('/:id', updateSupplierValidator, validateRequest, supplierController.update);

export default router;
