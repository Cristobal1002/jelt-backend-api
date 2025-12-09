import { Op } from 'sequelize';
import { Article } from '../../models/article.model.js';
import { Category } from '../../models/category.model.js';
import { Supplier } from '../../models/supplier.model.js';
import { Stockroom } from '../../models/stockroom.model.js';

class ArticleRepository {
  async create(data) {
    return Article.create(data);
  }

  async findById(id) {
    return Article.findOne({
      where: { id, isDelete: false },
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
  async findAllPaginated(filters, { limit, offset }) {
    const where = { isDelete: false };

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

  async update(id, data) {
    return Article.update(data, {
      where: { id, isDelete: false },
    });
  }

  async softDelete(id) {
    return Article.update(
      { isDelete: true, isActive: false },
      { where: { id } }
    );
  }
}

export const articleRepository = new ArticleRepository();
