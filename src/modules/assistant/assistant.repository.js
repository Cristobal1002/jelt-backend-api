import { Op, fn, col } from 'sequelize';
import { Article } from '../../models/article.model.js';
import { Stockroom } from '../../models/stockroom.model.js';
import { Category } from '../../models/category.model.js';
import { Supplier } from '../../models/supplier.model.js';

class AssistantRepository {
  async findArticleBySkuOrName({ sku, name, userId }) {
    const where = {};

    where.id_user = userId;

    if (sku) {
      where.sku = sku;
    }

    if (name) {
      where.name = { [Op.iLike]: `%${name}%` };
    }

    return Article.findAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' },
        { model: Stockroom, as: 'stockroom' },
      ],
      limit: 10,
    });
  }

  async findLowStockArticles({ limit = 20, stockroomId = null, userId }) {
    const where = {};

    where.id_user = userId;

    if (stockroomId) {
      where.id_stockroom = stockroomId;
    }

    const articles = await Article.findAll({
      where,
      limit,
    });

    // Filtro en memoria para no depender de HAVING
    return articles.filter((a) => {
      const stock = a.stock ?? 0;
      const reorderPoint = a.reorder_point ?? 0;
      return reorderPoint > 0 && stock <= reorderPoint;
    });
  }

  async getStockDistributionByStockroom({ userId }) {
    const where = {};

    where.id_user = userId;

    return Article.findAll({
      where,
      attributes: [
        'id_stockroom',
        [fn('SUM', col('stock')), 'total_stock'],
      ],
      include: [
        {
          model: Stockroom,
          as: 'stockroom',
          attributes: ['id', 'name', 'address', 'city', 'country'],
        },
      ],
      group: ['id_stockroom', 'stockroom.id'],
    });
  }

  async getReorderSuggestion({ articleId, sku, userId }) {
    const where = {};
    
    where.id_user = userId;

    if (articleId) {
      where.id = articleId;
    }

    if (sku) {
      where.sku = sku;
    }

    const article = await Article.findOne({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' },
        { model: Stockroom, as: 'stockroom' },
      ],
    });

    if (!article) {
      return null;
    }

    // --- Parámetros base del artículo ---
    const stock = article.stock ?? 0;

    // Ajusta estos campos a tu modelo real:
    const demandDailyAvg = Number(article.demand_daily_avg ?? 0);   // demanda promedio diaria
    const demandDailyStd = Number(article.demand_daily_std ?? 0);   // desviación estándar diaria
    const leadTimeDays   = Number(article.lead_time ?? 1);     // lead time en días
    const serviceLevel   = Number(article.service_level ?? 0.95);   // 95% por defecto

    const currentReorderPoint = article.reorder_point ?? null;

    // --- Función auxiliar para obtener z según nivel de servicio ---
    const getZFromServiceLevel = (sl) => {
      // Valores típicos (aprox):
      // 0.90 -> 1.28
      // 0.95 -> 1.65
      // 0.98 -> 2.05
      // 0.99 -> 2.33
      if (sl >= 0.995) return 2.58;
      if (sl >= 0.99) return 2.33;
      if (sl >= 0.98) return 2.05;
      if (sl >= 0.95) return 1.65;
      if (sl >= 0.90) return 1.28;
      return 1.0; // nivel de servicio bajo por defecto
    };

    const z = getZFromServiceLevel(serviceLevel);

    // --- Cálculos de demanda durante el lead time ---
    const expectedDemandLT = demandDailyAvg * leadTimeDays;
    const demandStdLT = demandDailyStd * Math.sqrt(leadTimeDays);

    // --- Stock de seguridad ---
    const safetyStock = z * demandStdLT;

    // --- Reorder point recomendado ---
    const recommendedROP = expectedDemandLT + safetyStock;

    // --- Cantidad sugerida a reordenar ---
    const suggestedQty = Math.max(recommendedROP - stock, 0);

    return {
      article,
      stock,
      demandDailyAvg,
      demandDailyStd,
      leadTimeDays,
      serviceLevel,
      z,
      expectedDemandLT,
      demandStdLT,
      safetyStock,
      currentReorderPoint,
      recommendedROP,
      suggestedQty,
    };
  }

  async findArticlesByCategoryOrSupplier({
    categoryId,
    categoryName,
    supplierId,
    supplierName,
    lowStockOnly = false,
    limit = 50,
    userId
  }) {
    const where = {};
    where.id_user = userId;
    const include = [];

    if (categoryId || categoryName) {
      const categoryWhere = {};
      if (categoryId) {
        categoryWhere.id = categoryId;
      }
      if (categoryName) {
        categoryWhere.name = { [Op.iLike]: `%${categoryName}%` };
      }

      include.push({
        model: Category,
        as: 'category',
        where: categoryWhere,
      });
    } else {
      include.push({ model: Category, as: 'category' });
    }

    if (supplierId || supplierName) {
      const supplierWhere = {};
      if (supplierId) {
        supplierWhere.id = supplierId;
      }
      if (supplierName) {
        supplierWhere.name = { [Op.iLike]: `%${supplierName}%` };
      }

      include.push({
        model: Supplier,
        as: 'supplier',
        where: supplierWhere,
      });
    } else {
      include.push({ model: Supplier, as: 'supplier' });
    }

    include.push({ model: Stockroom, as: 'stockroom' });

    const articles = await Article.findAll({
      where,
      include,
      limit,
    });

    if (!lowStockOnly) {
      return articles;
    }

    return articles.filter((a) => {
      const stock = a.stock ?? 0;
      const reorderPoint = a.reorder_point ?? 0;
      return reorderPoint > 0 && stock <= reorderPoint;
    });
  }
}

export const assistantRepository = new AssistantRepository();
