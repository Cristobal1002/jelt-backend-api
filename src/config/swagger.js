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
            code: { type: 'integer', example: 200 },
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login exitoso' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              },
            },
            error: {
              type: 'object',
              example: {},
            },
          },
          required: ['code', 'success', 'message', 'data', 'error'],
        },
        AuthRegisterResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 201 },
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Usuario registrado' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' }
              },
            },
            error: {
              type: 'object',
              example: {},
            },
          },
          required: ['code', 'success', 'message', 'data', 'error'],
        },
        AuthUpdateResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 200 },
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success operation' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Usuario actualizado' }
              },
            },
            error: {
              type: 'object',
              example: {},
            },
          },
          required: ['code', 'success', 'message', 'data', 'error'],
        },
        AuthDeleteResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 200 },
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success operation' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Usuario eliminado' }
              },
            },
            error: {
              type: 'object',
              example: {},
            },
          },
          required: ['code', 'success', 'message', 'data', 'error'],
        },
        AuthFindResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 200 },
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success operation' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' }
              },
            },
            error: {
              type: 'object',
              example: {},
            },
          },
          required: ['code', 'success', 'message', 'data', 'error'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 400 },
            success: { type: 'boolean', example: false },
            message: { type: 'object' },
            data: { type: 'object' },
            error: { type: 'string' },
          },
        },
        ErrorUnauthorizedResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 401 },
            success: { type: 'boolean', example: false },
            message: { type: 'object', example: 'Token is invalid or expired' },
            data: { type: 'object' },
            error: { type: 'string' },
          },
        },
        ErrorNotFoundResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 404 },
            success: { type: 'boolean', example: false },
            message: { type: 'object', example: 'Not found' },
            data: { type: 'object' },
            error: { type: 'string', example: 'Usuario no encontrado' },
          },
        },
        
        // === Entidades de inventario ===
        Article: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            sku: { type: 'string', example: 'SKU-001' },
            name: { type: 'string', example: 'Mouse inalámbrico' },
            id_category: { type: 'string', format: 'uuid' },
            id_supplier: { type: 'string', format: 'uuid' },
            id_stockroom: { type: 'string', format: 'uuid' },
            reorder_point: { type: 'integer', nullable: true, example: 5 },
            lead_time: { type: 'integer', nullable: true, example: 3 },
            description: { type: 'string', nullable: true },
            unit_price: { type: 'number', format: 'float', example: 120000 },
            unit_cost: { type: 'number', format: 'float', example: 90000 },
            stock: { type: 'integer', example: 10 },
            isActive: { type: 'boolean', example: true },
            isDelete: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Tecnología' },
            description: { type: 'string', nullable: true },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        Supplier: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Proveedor XYZ' },
            nit: { type: 'string', example: '900123456-7' },
            address: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        Stockroom: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Bodega principal' },
            address: { type: 'string', nullable: true },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Meta de paginación reutilizable
        PaginationMeta: {
          type: 'object',
          properties: {
            total_results: { type: 'integer', example: 42 },
            total_pages: { type: 'integer', example: 5 },
            current_page: { type: 'integer', example: 1 },
            per_page: { type: 'integer', example: 10 },
          },
        },
      },
    },
  },
  apis: [
    // Rutas principales
    path.resolve(__dirname, '../routes/*.js'),
    path.resolve(__dirname, '../modules/**/*.swagger.js'),
    // Módulos (como auth.routes.js)
    path.resolve(__dirname, '../modules/**/*.routes.js'),
  ],
};
