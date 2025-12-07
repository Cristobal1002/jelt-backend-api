import express from 'express';
import { authController } from './auth.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import {
  registerValidator,
  loginValidator,
  updateValidator,
} from './auth.validator.js';

export const auth = express.Router();

auth.post('/register', registerValidator, (req, res) =>
  authController.register(req, res)
);

auth.post('/login', loginValidator, (req, res) =>
  authController.login(req, res)
);

auth.put('/update', authMiddleware, updateValidator, (req, res) =>
  authController.update(req, res)
);

auth.delete('/delete', authMiddleware, (req, res) =>
  authController.delete(req, res)
);

auth.get('/find', (req, res) =>
  authController.getByEmail(req, res)
);
