/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: >
 *      El módulo **Articles** se encarga de administrar los artículos del inventario.
 *      Este módulo es el núcleo del inventario, ya que centraliza toda la información de los productos que se gestionan en el sistema.
 *      <br/>Permite:
 *      <ul><li>Crear nuevos artículos con su información básica: SKU, nombre, categoría, proveedor, bodega, precios y stock.</li>
 *      <li>Listar artículos con paginación y filtros por nombre, SKU y rangos de precio.</li>
 *      <li>Consultar el detalle de un artículo específico por su ID.</li>
 *      <li>Actualizar la información de un artículo existente.</li>
 *      <li>Realizar eliminación lógica (**soft delete**) de artículos, marcándolos como eliminados sin borrarlos físicamente de la base de datos.</li></ul>
 */

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Crear un nuevo artículo
 *     description: Crea un nuevo artículo en el inventario.
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - name
 *               - id_category
 *               - id_supplier
 *               - id_stockroom
 *               - unit_price
 *               - unit_cost
 *             properties:
 *               sku:
 *                 type: string
 *                 example: "SKU-001"
 *               name:
 *                 type: string
 *                 example: "Mouse inalámbrico"
 *               id_category:
 *                 type: string
 *                 format: uuid
 *               id_supplier:
 *                 type: string
 *                 format: uuid
 *               id_stockroom:
 *                 type: string
 *                 format: uuid
 *               unit_price:
 *                 type: number
 *                 format: float
 *               unit_cost:
 *                 type: number
 *                 format: float
 *               stock:
 *                 type: integer
 *               reorder_point:
 *                 type: integer
 *               lead_time:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Artículo creado exitosamente.
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
 *                 message:
 *                   type: string
 *                   example: "Article created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Article'
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


/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Listar artículos
 *     description: Retorna una lista paginada de artículos.
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         description: Número de página (por defecto 1)
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 10
 *         description: Registros por página (por defecto 10)
 *       - in: query
 *         name: sku
 *         schema:
 *           type: string
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: priceGt
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: priceLt
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *           format: float
 *     responses:
 *       200:
 *         description: Lista de artículos obtenida correctamente.
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
 *                 message:
 *                   type: string
 *                   example: "Articles retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Article'
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
 * /articles/{id}:
 *   get:
 *     summary: Obtener un artículo por ID
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del artículo
 *     responses:
 *       200:
 *         description: Artículo obtenido correctamente.
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
 *                   $ref: '#/components/schemas/Article'
 *                 error:
 *                   type: object
 *       401:
 *         description: Token inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 *       404:
 *         description: Artículo no encontrado.
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


/**
 * @swagger
 * /articles/{id}:
 *   put:
 *     summary: Actualizar un artículo
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del artículo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *               name:
 *                 type: string
 *               id_category:
 *                 type: string
 *                 format: uuid
 *               id_supplier:
 *                 type: string
 *                 format: uuid
 *               id_stockroom:
 *                 type: string
 *                 format: uuid
 *               unit_price:
 *                 type: number
 *                 format: float
 *               unit_cost:
 *                 type: number
 *                 format: float
 *               stock:
 *                 type: integer
 *               reorder_point:
 *                 type: integer
 *               lead_time:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Artículo actualizado correctamente.
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
 *                   example: "Article updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Article'
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
 *         description: Artículo no encontrado.
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


/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     summary: Eliminación lógica de un artículo
 *     description: Marca el artículo como eliminado (`isDelete = true`).
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del artículo
 *     responses:
 *       200:
 *         description: Artículo eliminado lógicamente.
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
 *                   example: "Article deleted successfully"
 *                 data:
 *                   type: object
 *                 error:
 *                   type: object
 *       401:
 *         description: Token inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 *       404:
 *         description: Artículo no encontrado.
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
