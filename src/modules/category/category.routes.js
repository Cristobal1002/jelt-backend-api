import { Router } from 'express';
import { categoryController } from './category.controller.js';
import {
  listCategoryValidator,
  createCategoryValidator,
} from './category.validator.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate-request.middleware.js';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: > 
 *      El módulo **Categories** se encarga de la administración de las categorías en las que se clasifican los artículos.
 *      Las categorías permiten organizar los artículos en grupos lógicos (como **“Inyectables”**, **“Papelería”**, **“Genericos”**), facilitando búsquedas y reportes dentro del inventario.
 *      <br/>Permite:
 *      <ul><li>Listar categorías con paginación y filtros (por ejemplo, por nombre o estado).</li>
 *      <li>Consultar el detalle de una categoría específica por su ID.</li></ul>
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Listar categorías
 *     tags: [Categories]
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
 *         description: Filtro por nombre
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtro por estado activo
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida correctamente.
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
 *                         $ref: '#/components/schemas/Category'
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
/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crear nueva categoría
 *     tags: [Categories]
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
 *                 example: "Inyectables"
 *               description:
 *                 type: string
 *                 example: "Categoría para productos inyectables"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
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
router.post('/', createCategoryValidator, validateRequest, categoryController.create);

router.get('/', listCategoryValidator, validateRequest, categoryController.list);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     tags: [Categories]
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
 *         description: Categoría obtenida correctamente.
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
 *                   $ref: '#/components/schemas/Category'
 *                 error:
 *                   type: object
 *       401:
 *         description: Token inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 *       404:
 *         description: Categoría no encontrada.
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
router.get('/:id', categoryController.getById);

export default router;
