import { Op } from 'sequelize';
import { Category } from '../../models/category.model.js';

class CategoryRepository {
  async create(userId, data) {
    return Category.create({
      ...data,
      id_user: userId,
    });
  }

  async findById(userId, id) {
    return Category.findOne({ where: { id, id_user: userId } });
  }

  async findAllPaginated(userId, filters, { limit, offset }) {
    const where = {};

    where.id_user = userId;

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

  async update(userId, id, data) {
    return Category.update(data, { where: { id, id_user: userId } });
  }
}

export const categoryRepository = new CategoryRepository();
