import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authRecoveryController } from './auth.recovery.controller.js';
import {
  registerValidator,
  loginValidator,
  updateValidator,
} from './auth.validator.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateRequest  } from '../../middlewares/validate-request.middleware.js';
import { recoveryRequestValidator, tempLoginValidator } from './auth.recovery.validator.js';

const router = Router();

router.post(
  '/register',
  registerValidator,
  validateRequest,
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
  authMiddleware,
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

router.post(
  '/recover',
  recoveryRequestValidator,
  validateRequest,
  authRecoveryController.requestRecovery
);

router.post(
  '/login-temp',
  tempLoginValidator,
  validateRequest,
  authRecoveryController.loginTemp
);

export default router;