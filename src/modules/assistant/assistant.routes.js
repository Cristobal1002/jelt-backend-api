import { Router } from 'express';
import { assistantController } from './assistant.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { chatValidator } from './assistant.validator.js';
import { validateRequest } from '../../middlewares/validate-request.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Assistant
 *   description: Chatbot de IA para consultas de inventario
 */

/**
 * @swagger
 * /assistant/chat:
 *   post:
 *     summary: Interactuar con el asistente de inventario
 *     tags: [Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "¿Qué artículos están por agotarse en el almacén principal?"
 *     responses:
 *       200:
 *         description: Respuesta generada por el asistente
 */
router.post(
  '/chat',
  authMiddleware,
  chatValidator,
  validateRequest,
  assistantController.chat
);

export default router;
