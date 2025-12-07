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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación y gestión de usuario
 */


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registro de usuario
 *     description: Crea un nuevo usuario con email y contraseña.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRegisterResponse'
 *       400:
 *         description: Error de validación o email ya registrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/register',
  registerValidator,           // reglas de express-validator
  validateRequest,   // lanza RequestValidationError si hay errores
  authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuario
 *     description: Autentica un usuario con email y contraseña y devuelve un JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       400:
 *         description: Credenciales inválidas o error de validación.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/login',
  loginValidator,
  validateRequest,
  authController.login
);

/**
 * @swagger
 * /auth/update:
 *   put:
 *     summary: Actualizar datos del usuario autenticado
 *     description: Actualiza información básica del usuario logueado.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 format: 'uuid'
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUpdateResponse'
 *       400:
 *         description: Error de validación.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o no enviado.
  *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 */
router.put(
  '/update',
  authMiddleware,              // requiere JWT
  updateValidator,
  validateRequest,
  authController.update
);

/**
 * @swagger
 * /auth/delete:
 *   delete:
 *     summary: Eliminar (soft delete) el usuario autenticado
 *     description: Marca el usuario como eliminado sin borrar el registro físicamente.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario que se desea eliminar.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "3e1b19f8-4e61-4bc1-af37-b78f7cbf5a1d"
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthDeleteResponse'
 *       400:
 *         description: Error de autorización.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 *       401:
 *         description: Error de autorización.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 */
router.delete(
  '/delete/:id',
  authMiddleware,
  authController.delete
);

/**
 * @swagger
 * /auth/find:
 *   get:
 *     summary: Buscar usuario por email
 *     description: Obtiene un usuario por su dirección de email.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: Email del usuario a buscar.
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthFindResponse'
 *       400:
 *         description: Falta el parámetro email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Error de autorización.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 *       404:
 *         description: No se encontró un usuario con ese email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFoundResponse'
 */
router.get(
  '/find',
  authMiddleware,
  authController.getByEmail
);

/**
 * @swagger
 * /auth/find/{id}:
 *   get:
 *     summary: Buscar usuario por Id
 *     description: Obtiene un usuario por su id de registro.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario que se desea buscar.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "3e1b19f8-4e61-4bc1-af37-b78f7cbf5a1d"
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthFindResponse'
 *       400:
 *         description: Falta el parámetro id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Error de autorización.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 *       404:
 *         description: No se encontró un usuario con ese email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFoundResponse'
 */
router.get(
  '/find/:id',
  authMiddleware,
  authController.getById
);


// VALIDAR token Bearer y obtener info del usuario del token
router.get(
  '/validate-token',
  authMiddleware,
  authController.validateToken
);

export default router;