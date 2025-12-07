import { CustomError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log completo del error
  logger.error(
    {
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    },
    'Unhandled error'
  );

  // Si es un CustomError (BadRequestError, ForbiddenError, etc.)
  if (err instanceof CustomError) {
    const serialized = err.serialize();
    const status = serialized.status || err.statusCode || 500;

    // Elegimos qué helper de responseHandler usar en base al status
    switch (status) {
      case 400:
        // 400 Bad Request
        return res.badRequest(
          serialized,                // va en "error" o "data" según tu implementación
          serialized.title || err.message || 'Bad request'
        );

      case 401:
        // 401 Unauthorized
        return res.unauthorized(
          serialized,
          serialized.title || err.message || 'Unauthorized'
        );

      case 403:
        // 403 Forbidden
        return res.forbidden(
          serialized,
          serialized.title || err.message || 'Forbidden'
        );

      case 404:
        // 404 Not Found
        return res.notFound(
          serialized.title || err.message || 'Not found'
        );

      case 409:
        // 409 Conflict
        return res.badRequest(
          serialized,
          serialized.title || err.message || 'Conflict'
        );

      default:
        // Cualquier otro CustomError → 5xx
        return res.serverError(
          serialized,
          serialized.title || err.message || 'Server error'
        );
    }
  }

  // Errores no controlados (no son CustomError)
  const isProd = process.env.NODE_ENV === 'production';

  return res.serverError(
    {
      // Estos campos son por si quieres seguir usando el estilo "problem+json" internamente
      type: 'about:blank',
      title: 'Internal server error',
      status: 500,
    },
    isProd ? 'Internal server error' : err.message
  );
};

export const errorHandlerMiddleware = {
  errorHandler,
};
