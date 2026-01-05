import { Router } from 'express';
import { assistantController } from './assistant.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { chatValidator } from './assistant.validator.js';
import { validateRequest } from '../../middlewares/validate-request.middleware.js';

const router = Router();

router.post(
  '/chat',
  authMiddleware,
  chatValidator,
  validateRequest,
  assistantController.chat
);

export default router;
