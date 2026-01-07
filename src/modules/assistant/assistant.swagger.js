
/**
 * @swagger
 * tags:
 *   name: Assistant
 *   description: Chatbot de IA para consultas de inventario. <br/><b> Para 'conversationId' el campo que debería contener el ID de la conversación previa para contextos continuos. Si es nulo, se inicia una nueva conversación.</b>
 */

/**
 * @swagger
 * /assistant/chat:
 *   post:
 *     summary: Interactuar con el asistente de inventario. 
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
 *                 example: "Crea una categoria con nombre 'Intrumentos Odontología' y descripción 'Instrumentos y equipos para odontología'."
 *               conversationId:
 *                 type: string
 *                 format: uuid
 *                 example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *     responses:
 *       200:
 *         description: Respuesta generada por el asistente
 */