import { Router } from 'express';
import { stockroomController } from './stockroom.controller.js';
import {
  createStockroomValidator,
  updateStockroomValidator,
  listStockroomValidator,
} from './stockroom.validator.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate-request.middleware.js';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Stockrooms
 *   description: > 
 *     El módulo **Stockrooms** (Gestión de bodegas / almacenes) administra las bodegas o almacenes donde se guardan los artículos.
 *     con este módulo, el sistema puede saber en qué ubicación física se encuentra el inventario y soportar escenarios con múltiples almacenes.
 *     <br/>Permite:
 *         <ul><li>Crear nuevas bodegas indicando nombre y dirección.</li>
 *         <li>Listar bodegas con paginación y filtros por nombre o estado.</li>
 *         <li>Consultar el detalle de una bodega específica.</li>
 *         <li>Actualizar los datos de una bodega (nombre, dirección, estado).</li></ul>
 */


/**
 * @swagger
 * /stockroom:
 *   post:
 *     summary: Crear una nueva bodega
 *     tags: [Stockrooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Bodega principal"
 *               address:
 *                 type: string
 *                 example: "Calle 123 #45-67"
 *     responses:
 *       201:
 *         description: Bodega creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Stockroom'
 *                 error:
 *                   type: object
 *       400:
 *         description: Error de validación en los datos de entrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', createStockroomValidator, validateRequest, stockroomController.create);

/**
 * @swagger
 * /stockroom:
 *   get:
 *     summary: Listar bodegas
 *     tags: [Stockrooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de bodegas obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Stockroom'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *                 error:
 *                   type: object
 *       401:
 *         description: Token inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', listStockroomValidator, validateRequest, stockroomController.list);

/**
 * @swagger
 * /stockroom/{id}:
 *   get:
 *     summary: Obtener bodega por ID
 *     tags: [Stockrooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Bodega obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Stockroom'
 *                 error:
 *                   type: object
 *       401:
 *         description: Token inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 *       404:
 *         description: Bodega no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFoundResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', stockroomController.getById);

/**
 * @swagger
 * /stockroom/{id}:
 *   put:
 *     summary: Actualizar bodega
 *     tags: [Stockrooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Bodega actualizada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Store updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Stockroom'
 *                 error:
 *                   type: object
 *       400:
 *         description: Error de validación en los datos de entrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 *       404:
 *         description: Bodega no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFoundResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', updateStockroomValidator, validateRequest, stockroomController.update);

export default router;
