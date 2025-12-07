import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//GET http://localhost:{PORT}/api/{VERSION}/docs

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jelt Backend API',
      version: config.app.apiVersion || 'v1',
      description: 'Documentación de la API de Jelt (health + auth)',
    },
    servers: [
      {
        url: `http://localhost:${config.app.port}/api/${config.app.apiVersion}`,
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            isDelete: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthLoginResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: [
    // Rutas principales
    path.resolve(__dirname, '../routes/*.js'),
    // Módulos (como auth.routes.js)
    path.resolve(__dirname, '../modules/**/*.routes.js'),
  ],
};
