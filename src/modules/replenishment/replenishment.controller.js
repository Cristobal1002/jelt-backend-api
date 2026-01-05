import { replenishmentService } from './replenishment.service.js';

const getByArticleId = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    
    const userId = req.user?.id || null;

    const data = await replenishmentService.getArticleReplenishmentById(
      userId,
      articleId
    );

    if (!data) {
      const error = new Error('Artículo no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Usamos el helper res.ok que ya tienes en el proyecto
    return res.ok(data, 'Métricas de reabastecimiento obtenidas correctamente');
  } catch (err) {
    next(err);
  }
};

const getBySku = async (req, res, next) => {
  try {
    const { sku } = req.params;
    const userId = req.user?.id || null;
    const data = await replenishmentService.getArticleReplenishmentBySku(userId, sku);

    if (!data) {
      const error = new Error('Artículo no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return res.ok(data, 'Métricas de reabastecimiento obtenidas correctamente');
  } catch (err) {
    next(err);
  }
};

export const replenishmentController = {
  getByArticleId,
  getBySku,
};
