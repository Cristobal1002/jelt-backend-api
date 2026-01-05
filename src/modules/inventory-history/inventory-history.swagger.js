/**
 * @swagger
 * tags:
 *   name: InventoryHistory
 *   description: Históricos de inventario (ventas y movimientos) para análisis y soporte del Assistant IA
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SalesHistoryCreate:
 *       type: object
 *       required:
 *         - id_article
 *         - id_stockroom
 *         - quantity
 *         - sold_at
 *       properties:
 *         id_article:
 *           type: string
 *           format: uuid
 *           example: "5b8c4f42-7c2e-4a4a-9f57-6e468d6b0c0a"
 *         id_stockroom:
 *           type: string
 *           format: uuid
 *           example: "a86e8f10-4a3b-4b4d-9dbf-0da0b5a5d0a1"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 3
 *         unit_price:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 19.99
 *         sold_at:
 *           type: string
 *           format: date-time
 *           example: "2025-12-01T14:30:00.000Z"
 *         metadata:
 *           type: object
 *           nullable: true
 *           example:
 *             channel: "pos"
 *             order_id: "ORD-1001"
 *
 *     SalesHistory:
 *       allOf:
 *         - $ref: '#/components/schemas/SalesHistoryCreate'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               example: "c2c7c4c6-2dd4-4f1d-8f58-6d1d5e4b5c2e"
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *
 *     SalesSummary:
 *       type: object
 *       properties:
 *         article_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         stockroom_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         from:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         to:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         total_quantity:
 *           type: integer
 *           example: 120
 *         total_revenue:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 1520.55
 *         avg_daily_quantity:
 *           type: number
 *           format: float
 *           example: 4.0
 *         days_in_range:
 *           type: integer
 *           example: 30
 *
 *     TopSellingArticleItem:
 *       type: object
 *       properties:
 *         id_article:
 *           type: string
 *           format: uuid
 *         total_quantity:
 *           type: integer
 *           example: 45
 *         article:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             sku:
 *               type: string
 *               example: "SKU-001"
 *             name:
 *               type: string
 *               example: "Producto A"
 *
 *     StockMovementCreate:
 *       type: object
 *       required:
 *         - id_article
 *         - id_stockroom
 *         - type
 *         - quantity
 *         - moved_at
 *       properties:
 *         id_article:
 *           type: string
 *           format: uuid
 *           example: "5b8c4f42-7c2e-4a4a-9f57-6e468d6b0c0a"
 *         id_stockroom:
 *           type: string
 *           format: uuid
 *           example: "a86e8f10-4a3b-4b4d-9dbf-0da0b5a5d0a1"
 *         type:
 *           type: string
 *           enum: [IN, OUT, ADJUSTMENT]
 *           example: "OUT"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 10
 *         reference:
 *           type: string
 *           nullable: true
 *           example: "PO-7781"
 *         moved_at:
 *           type: string
 *           format: date-time
 *           example: "2025-12-01T15:00:00.000Z"
 *         metadata:
 *           type: object
 *           nullable: true
 *           example:
 *             reason: "inventory_count"
 *
 *     StockMovement:
 *       allOf:
 *         - $ref: '#/components/schemas/StockMovementCreate'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               example: "2caa9d0d-0b63-4b84-9c1b-0d09fd2c91d1"
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *
 *     StockMovementSummary:
 *       type: object
 *       properties:
 *         article_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         stockroom_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         from:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         to:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         totals:
 *           type: object
 *           properties:
 *             IN:
 *               type: integer
 *               example: 120
 *             OUT:
 *               type: integer
 *               example: 95
 *             ADJUSTMENT:
 *               type: integer
 *               example: 5
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Validation error"
 *         errors:
 *           type: array
 *           nullable: true
 *           items:
 *             type: object
 */


/**
 * @swagger
 * /inventory-history/sales:
 *   post:
 *     tags: [InventoryHistory]
 *     summary: Crea un registro de venta histórica
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SalesHistoryCreate'
 *     responses:
 *       201:
 *         description: Venta registrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesHistory'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 *
 *   get:
 *     tags: [InventoryHistory]
 *     summary: Lista ventas históricas (con filtros)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: articleId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: Filtra por artículo
 *       - in: query
 *         name: stockroomId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: Filtra por almacén
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Fecha inicio (sold_at >= from)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Fecha fin (sold_at <= to)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 50
 *         required: false
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           example: 0
 *         required: false
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SalesHistory'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */

/**
 * @swagger
 * /inventory-history/sales/summary:
 *   get:
 *     tags: [InventoryHistory]
 *     summary: Resumen de ventas (totales y promedio diario)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: articleId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *       - in: query
 *         name: stockroomId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *     responses:
 *       200:
 *         description: Resumen de ventas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesSummary'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */


/**
 * @swagger
 * /inventory-history/sales/top:
 *   get:
 *     tags: [InventoryHistory]
 *     summary: Top artículos más vendidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stockroomId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: Si se envía, calcula el top solo para ese almacén
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           example: 30
 *         required: false
 *         description: Ventana de días hacia atrás (default recomendado: 30)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         required: false
 *     responses:
 *       200:
 *         description: Ranking de artículos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 days:
 *                   type: integer
 *                   example: 30
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TopSellingArticleItem'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */


/**
 * @swagger
 * /inventory-history/movements:
 *   post:
 *     tags: [InventoryHistory]
 *     summary: Crea un movimiento de stock (IN/OUT/ADJUSTMENT)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockMovementCreate'
 *     responses:
 *       201:
 *         description: Movimiento creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockMovement'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 *
 *   get:
 *     tags: [InventoryHistory]
 *     summary: Lista movimientos (con filtros)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: articleId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *       - in: query
 *         name: stockroomId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IN, OUT, ADJUSTMENT]
 *         required: false
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 50
 *         required: false
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           example: 0
 *         required: false
 *     responses:
 *       200:
 *         description: Lista de movimientos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StockMovement'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */


/**
 * @swagger
 * /inventory-history/movements/summary:
 *   get:
 *     tags: [InventoryHistory]
 *     summary: Resumen de movimientos (totales por tipo)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: articleId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *       - in: query
 *         name: stockroomId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *     responses:
 *       200:
 *         description: Resumen de movimientos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockMovementSummary'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */

