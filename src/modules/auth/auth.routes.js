import { Router } from 'express';
import { authController } from './auth.controller.js';
import {
  registerValidator,
  loginValidator,
  updateValidator,
} from './auth.validator.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateRequest  } from '../../middlewares/validate-request.middleware.js';

const router = Router();

router.post(
  '/register',
  registerValidator,           // reglas de express-validator
  validateRequest,   // lanza RequestValidationError si hay errores
  authController.register
);

router.post(
  '/login',
  loginValidator,
  validateRequest,
  authController.login
);

router.put(
  '/update',
  authMiddleware,              // requiere JWT
  updateValidator,
  validateRequest,
  authController.update
);

router.delete(
  '/delete/:id',
  authMiddleware,
  authController.delete
);

router.get(
  '/find',
  authMiddleware,
  authController.getByEmail
);

router.get(
  '/find/:id',
  authMiddleware,
  authController.getById
);

router.get(
  '/validate-token',
  authMiddleware,
  authController.validateToken
);

export default router;