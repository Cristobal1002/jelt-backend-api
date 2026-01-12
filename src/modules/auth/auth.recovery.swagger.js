/**
 * @swagger
 * tags:
 *   - name: Auth Recovery
 *     description: Endpoints para recuperación de cuenta y login temporal
 */

/**
 * @swagger
 * /auth/recover:
 *   post:
 *     tags: [Auth Recovery]
 *     summary: Solicitar recuperación de cuenta
 *     description: |
 *       Envía un correo con un código temporal (y opcionalmente un enlace) para permitir el acceso temporal.
 *       Por seguridad, la respuesta es la misma aunque el email no exista (evita enumeración de usuarios).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@dominio.com
 *     responses:
 *       200:
 *         description: Solicitud procesada (siempre devuelve OK)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: If the email exists, recovery instructions were sent
 *                 data:
 *                   type: object
 *                   properties:
 *                     send:
 *                       type: boolean
 *                       example: true
 *                 error:
 *                   type: object
 *       400:
 *         description: Error de validación (payload inválido)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: email
 *                       message:
 *                         type: string
 *                         example: Invalid email
 */

/**
 * @swagger
 * /auth/login-temp:
 *   post:
 *     tags: [Auth Recovery]
 *     summary: Login con código temporal
 *     description: |
 *       Permite iniciar sesión usando un código temporal enviado por correo.
 *       El código expira si han pasado más de 60 minutos desde su generación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@dominio.com
 *               password:
 *                 type: string
 *                 description: Código temporal recibido por correo (sirve como password temporal)
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso con código temporal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       400:
 *         description: Error de validación (payload inválido)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: code
 *                       message:
 *                         type: string
 *                         example: Code is required
 *       401:
 *         description: Código inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired temporary code
 *       403:
 *         description: La cuenta no está bloqueada o no aplica para login temporal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 403
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Account is not locked
 *                 data:
 *                   type: object
 *                 error:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: https://jelt.com/errors/forbidden
 *                     title:
 *                       type: string
 *                       example: Account is not locked
 *                     status:
 *                       type: integer
 *                       example: 403
 */
