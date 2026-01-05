/**
 * @swagger
 * tags:
 *   name: Replenishment
 *   description: >
 *      Endpoints para métricas de reabastecimiento de inventario. Con esto en el frontend es posible:
 *      <ul><li>Mostrar columnas como:</li>
 *      <li>stock_actual</li>
 *      <li>reorder_point_recomendado</li>
 *      <li>cantidad_reorden_sugerida</li>
 *      <li>nivel_servicio</li>
 *      <li>Hacer gráficos de stock vs ROP, etc.</li></ul>
 */

/**
 * @swagger
 * /replenishment/articles/{articleId}:
 *   get:
 *     summary: Obtener métricas de reabastecimiento para un artículo por su ID
 *     tags: [Replenishment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del artículo (UUID)
 *     responses:
 *       200:
 *         description: Métricas de reabastecimiento calculadas
 *       404:
 *         description: Artículo no encontrado
 */

/**
 * @swagger
 * /replenishment/articles/by-sku/{sku}:
 *   get:
 *     summary: Obtener métricas de reabastecimiento para un artículo por su SKU
 *     tags: [Replenishment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU del artículo
 *     responses:
 *       200:
 *         description: Métricas de reabastecimiento calculadas
 *       404:
 *         description: Artículo no encontrado
 */
