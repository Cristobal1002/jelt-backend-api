import { Op, fn, col, literal } from 'sequelize';
import { SalesHistory } from '../../models/sales-history.model.js';
import { StockMovement } from '../../models/stock-movement.model.js';
import { Article } from '../../models/article.model.js';
import { Stockroom } from '../../models/stockroom.model.js';

const parseDateRange = ({ from, to }) => {
  const where = {};
  if (from) where[Op.gte] = new Date(from);
  if (to) where[Op.lte] = new Date(to);
  return Object.keys(where).length ? where : null;
};

class InventoryHistoryRepository {
  // -------------------------
  // Sales history CRUD
  // -------------------------
  async createSale(payload) {
    return SalesHistory.create(payload);
  }

  async listSales({ articleId, stockroomId, from, to, limit = 50, offset = 0 }) {
    const where = { isDelete: false };
    if (articleId) where.id_article = articleId;
    if (stockroomId) where.id_stockroom = stockroomId;

    const soldAt = parseDateRange({ from, to });
    if (soldAt) where.sold_at = soldAt;

    const { rows, count } = await SalesHistory.findAndCountAll({
      where,
      include: [
        { model: Article, as: 'article' },
        { model: Stockroom, as: 'stockroom' },
      ],
      order: [['sold_at', 'DESC']],
      limit,
      offset,
    });

    return { rows, count, limit, offset };
  }

  async getSalesSummary({ articleId, stockroomId, from, to }) {
    const where = { isDelete: false };
    if (articleId) where.id_article = articleId;
    if (stockroomId) where.id_stockroom = stockroomId;

    const soldAt = parseDateRange({ from, to });
    if (soldAt) where.sold_at = soldAt;

    const [res] = await SalesHistory.findAll({
      where,
      attributes: [
        [fn('COUNT', col('SalesHistory.id')), 'transactions'],
        [fn('SUM', col('SalesHistory.quantity')), 'units_sold'],
        [fn('MIN', col('SalesHistory.sold_at')), 'first_sale_at'],
        [fn('MAX', col('SalesHistory.sold_at')), 'last_sale_at'],
      ],
      raw: true,
    });

    return {
      transactions: Number(res?.transactions ?? 0),
      units_sold: Number(res?.units_sold ?? 0),
      first_sale_at: res?.first_sale_at ?? null,
      last_sale_at: res?.last_sale_at ?? null,
    };
  }

  async getAverageDailySales({ articleId, stockroomId, days = 30 }) {
    const from = new Date();
    from.setDate(from.getDate() - Number(days));

    const where = {
      isDelete: false,
      sold_at: { [Op.gte]: from },
    };
    if (articleId) where.id_article = articleId;
    if (stockroomId) where.id_stockroom = stockroomId;

    // Promedio diario simple: total unidades / días ventana
    const [res] = await SalesHistory.findAll({
      where,
      attributes: [[fn('SUM', col('SalesHistory.quantity')), 'units_sold']],
      raw: true,
    });

    const units = Number(res?.units_sold ?? 0);
    const avg = units / Math.max(Number(days), 1);

    return { window_days: Number(days), units_sold: units, avg_daily_units: avg };
  }

  async getTopSellingArticles({ stockroomId, days = 30, limit = 10 }) {
    const from = new Date();
    from.setDate(from.getDate() - Number(days));

    const where = {
      isDelete: false,
      sold_at: { [Op.gte]: from },
    };
    if (stockroomId) where.id_stockroom = stockroomId;

    const items = await SalesHistory.findAll({
      where,
      attributes: [
        'id_article',
        [fn('SUM', col('SalesHistory.quantity')), 'units_sold'],
      ],
      include: [{ model: Article, as: 'article' }],
      group: ['id_article', 'article.id'],
      order: [[literal('units_sold'), 'DESC']],
      limit: Number(limit),
    });

    return items.map((i) => ({
      articleId: i.id_article,
      sku: i.article?.sku,
      name: i.article?.name,
      units_sold: Number(i.get('units_sold') ?? 0),
    }));
  }

  // -------------------------
  // Stock movements CRUD
  // -------------------------
  async createMovement(payload) {
    return StockMovement.create(payload);
  }

  async listMovements({
    articleId,
    stockroomId,
    type,
    from,
    to,
    limit = 50,
    offset = 0,
  }) {
    const where = { isDelete: false };
    if (articleId) where.id_article = articleId;
    if (stockroomId) where.id_stockroom = stockroomId;
    if (type) where.type = type;

    const movedAt = parseDateRange({ from, to });
    if (movedAt) where.moved_at = movedAt;

    const { rows, count } = await StockMovement.findAndCountAll({
      where,
      include: [
        { model: Article, as: 'article' },
        { model: Stockroom, as: 'stockroom' },
      ],
      order: [['moved_at', 'DESC']],
      limit,
      offset,
    });

    return { rows, count, limit, offset };
  }

  async getMovementSummary({ articleId, stockroomId, from, to }) {
    const where = { isDelete: false };
    if (articleId) where.id_article = articleId;
    if (stockroomId) where.id_stockroom = stockroomId;

    const movedAt = parseDateRange({ from, to });
    if (movedAt) where.moved_at = movedAt;

    const rows = await StockMovement.findAll({
      where,
      attributes: [
        'type',
        [fn('COUNT', col('StockMovement.id')), 'transactions'],
        [fn('SUM', col('StockMovement.quantity')), 'units'],
      ],
      group: ['type'],
      raw: true,
    });

    const byType = rows.reduce((acc, r) => {
      acc[r.type] = {
        transactions: Number(r.transactions ?? 0),
        units: Number(r.units ?? 0),
      };
      return acc;
    }, {});

    return byType;
  }

  // -------------------------
  // Assistant analytics helpers
  // -------------------------
  async predictStockoutDate({ articleId, stockroomId, days = 30 }) {
    if (!articleId) throw new Error('articleId is required');

    const article = await Article.findByPk(articleId);
    if (!article) return null;

    const avg = await this.getAverageDailySales({ articleId, stockroomId, days });
    const rate = Number(avg.avg_daily_units ?? 0);

    const stock = Number(article.stock ?? 0);
    if (rate <= 0) {
      return {
        articleId,
        sku: article.sku,
        name: article.name,
        stock,
        avg_daily_units: rate,
        estimated_stockout_at: null,
        note: 'No hay ventas suficientes en la ventana para estimar quiebre.',
      };
    }

    const daysToStockout = stock / rate;
    const estimated = new Date();
    estimated.setDate(estimated.getDate() + Math.floor(daysToStockout));

    return {
      articleId,
      sku: article.sku,
      name: article.name,
      stock,
      avg_daily_units: rate,
      window_days: Number(days),
      estimated_stockout_at: estimated.toISOString(),
      days_to_stockout: daysToStockout,
    };
  }
}

export const inventoryHistoryRepository = new InventoryHistoryRepository();
