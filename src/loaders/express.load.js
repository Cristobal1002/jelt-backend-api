import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import routes from '../routes/index.js';
import { responseHandler } from '../middlewares/index.js';
import { errorHandlerMiddleware } from '../middlewares/index.js';
import { swaggerOptions } from '../config/swagger.js';

const corsOriginOption = () => {
  const raw = config.cors.origin;
  if (raw === '*') return true;
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

/** Rutas que no deben consumir el contador global (login compartía IP del balanceador → 429). */
const skipGlobalRateLimit = (req) => {
  const path = (req.originalUrl || req.url || '').split('?')[0];
  if (path.includes('/health')) return true;
  return /\/auth\/(login|register|recover|login-temp)(\/|$)/.test(path);
};

export const loadExpress = (app) => {
  if (config.app.trustProxyHops > 0) {
    app.set('trust proxy', config.app.trustProxyHops);
  }

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: corsOriginOption(),
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-app-token'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Middleware de respuestas custom
  app.use(responseHandler);

  // Swagger only in development
  if(config.app.nodeEnv === 'development') {
    // Swagger (UI + JSON)
    const swaggerCustomCss = `
    .swagger-ui .opblock-tag small {
      display: block !important;
      margin-top: 4px !important;
    }
    .swagger-ui .opblock-tag a {
      display: block !important;
    }
    .swagger-ui .opblock-tag {
      display: block !important;
    }
    `;

    const swaggerSpec = swaggerJsdoc(swaggerOptions);

    app.use(
      `/api/${config.app.apiVersion}/docs`,
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: swaggerCustomCss,
      })
    );

    app.get(`/api/${config.app.apiVersion}/docs.json`, (req, res) => {
      res.json(swaggerSpec);
    });
  }

  // Rate limiting (auth público y health quedan fuera del contador global)
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
      success: false,
      message: 'Too many requests from this IP, try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipGlobalRateLimit,
  });
  app.use('/api/', limiter);

  // Request logging
  app.use((req, res, next) => {
    logger.info(
      {
        method: req.method,
        url: req.url,
        ip: req.ip,
      },
      'Incoming request'
    );
    next();
  });

  // Routes
  routes(app);

  // 404
  app.use((req, res, next) => {
    if (!res.headersSent) {
      return res.notFound('Route not found');
    }
    next();
  });

  // Error handler (debe ir al final)
  app.use(errorHandlerMiddleware.errorHandler);
};