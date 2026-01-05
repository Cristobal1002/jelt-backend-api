import { Op } from 'sequelize';
import { Article } from '../../models/article.model.js';
import { Category } from '../../models/category.model.js';
import { Supplier } from '../../models/supplier.model.js';
import { Stockroom } from '../../models/stockroom.model.js';

class ArticleRepository {

  async create(userId, data) {
    return Article.create({
      ...data,
      id_user: userId,
    });
  }

  async findById(userId, id) {
    return Article.findOne({
      where: { id, isDelete: false, id_user: userId },
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' },
        { model: Stockroom, as: 'stockroom' },
      ],
    });
  }

  /**
   * Filtros admitidos:
   * - id (igual)
   * - sku (contains, case-insensitive)
   * - name (contains, case-insensitive)
   * - priceGt, priceLt, priceMin, priceMax (unit_price con >, <, between)
   */
  async findAllPaginated(userId , filters, { limit, offset }) {
    const where = { isDelete: false };

    where.id_user = userId; // Obligar la consultar por usuario que lo pide.

    if (filters.id) {
      where.id = filters.id;
    }

    if (filters.sku) {
      where.sku = { [Op.iLike]: `%${filters.sku}%` };
    }

    if (filters.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }

    // unit_price condiciones
    const priceConditions = {};

    if (filters.priceGt != null) {
      priceConditions[Op.gt] = filters.priceGt;
    }

    if (filters.priceLt != null) {
      priceConditions[Op.lt] = filters.priceLt;
    }

    // Between: priceMin / priceMax
    if (filters.priceMin != null && filters.priceMax != null) {
      priceConditions[Op.between] = [filters.priceMin, filters.priceMax];
    } else {
      if (filters.priceMin != null) {
        priceConditions[Op.gte] = filters.priceMin;
      }
      if (filters.priceMax != null) {
        priceConditions[Op.lte] = filters.priceMax;
      }
    }

    if (Object.keys(priceConditions).length > 0) {
      where.unit_price = priceConditions;
    }

    const result = await Article.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' },
        { model: Stockroom, as: 'stockroom' },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return result; // { rows, count }
  }

  async update(userId, id, data) {
    return Article.update(data, {
      where: { id, isDelete: false, id_user: userId },
    });
  }

  async softDelete(userId, id) {
    return Article.update(
      { isDelete: true, isActive: false },
      { where: { id, id_user: userId } }
    );
  }
}

export const articleRepository = new ArticleRepository();
