import { Router } from 'express';
import { sqz } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Endpoints de estado de la API
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check básico
 *     description: Verifica que la API está viva (no comprueba base de datos).
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: La API está funcionando.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (req, res) => {
  return res.ok(
    {
      status: 'OK',
      timestamp: new Date().toISOString(),
    },
    'Service is healthy'
  );
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Verifica conectividad con la base de datos PostgreSQL.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: La API está lista y la base de datos responde.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: READY
 *       503:
 *         description: La base de datos no está disponible.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/ready', async (req, res) => {
  try {
    await sqz.authenticate();
    return res.ok(
      {
        status: 'READY',
        timestamp: new Date().toISOString(),
      },
      'Service is ready'
    );
  } catch (error) {
    logger.error({ error }, 'Database readiness check failed');
    return res.serverError(
      {
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
      },
      'Service is not ready'
    );
  }
});

// Liveness probe
router.get('/live', (req, res) => {
  return res.ok(
    {
      status: 'LIVE',
      timestamp: new Date().toISOString(),
    },
    'Service is alive'
  );
});


if (config.app.nodeEnv === 'development') {
    /**
    * @swagger
    * /health/not-found:
    *   get:
    *     summary: Prueba de error 404
    *     description: Endpoints de prueba de errores (solo en desarrollo)
    *     tags: [Health]
    *     responses:
    *       404:
    *         description: Resource not found.
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/ErrorResponse'
    */
    router.get('/not-found', async () => {
      const { NotFoundError } = await import('../errors/index.js');
      throw new NotFoundError('Property');
    });

    /**
    * @swagger
    * /health/forbidden:
    *   get:
    *     summary: Prueba de error 403
    *     description: Endpoint de prueba para lanzar un ForbiddenError y validar el middleware de errores.
    *     tags: [Health]
    *     responses:
    *       403:
    *         description: Acceso denegado simulado.
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/ErrorResponse'
    */
    router.get('/forbidden', async () => {
      const { ForbiddenError } = await import('../errors/index.js');
      throw new ForbiddenError('Access denied to resource');
    });

    /**
    * @swagger
    * /health/integration:
    *   get:
    *     summary: Prueba de error de integración
    *     description: Simula un error de integración externa (por ejemplo, Shopify) para probar el manejo de errores.
    *     tags: [Health]
    *     responses:
    *       502:
    *         description: Error de integración simulado.
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/ErrorResponse'
    */
    router.get('/integration', async () => {
      const { IntegrationError } = await import('../errors/index.js');
      throw new IntegrationError('Shopify', { credentials: 'Invalid credentials' });
    });

    /**
    * @swagger
    * /health/boom:
    *   get:
    *     summary: Prueba de error 500
    *     description: Lanza un error genérico para probar el manejo de errores 500.
    *     tags: [Health]
    *     responses:
    *       500:
    *         description: Error interno simulado.
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/ErrorResponse'
    */
    router.get('/boom', async () => {
      throw new Error('Internal explosion');
    });
}

export default router;