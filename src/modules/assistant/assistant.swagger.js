
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