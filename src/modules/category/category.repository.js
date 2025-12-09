import { Op } from 'sequelize';
import { Category } from '../../models/category.model.js';

class CategoryRepository {
  async create(data) {
    return Category.create(data);
  }

  async findById(id) {
    return Category.findByPk(id);
  }

  async findAllPaginated(filters, { limit, offset }) {
    const where = {};

    if (filters.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }

    if (typeof filters.isActive === 'boolean') {
      where.isActive = filters.isActive;
    }

    return Category.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']],
    });
  }

  async update(id, data) {
    return Category.update(data, { where: { id } });
  }
}

export const categoryRepository = new CategoryRepository();
