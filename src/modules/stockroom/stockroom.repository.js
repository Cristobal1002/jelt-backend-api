import { Op } from 'sequelize';
import { Stockroom } from '../../models/stockroom.model.js';

class StockroomRepository {
  async create(userId, data) {
    return Stockroom.create({ ...data, id_user: userId });
  }

  async findById(userId, id) {
    return Stockroom.findOne({ where: { id, id_user: userId } });
  }

  async findAllPaginated(userId, filters, { limit, offset }) {
    const where = { id_user: userId };

    if (filters.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }

    if (filters.nit) {
      where.nit = { [Op.iLike]: `%${filters.nit}%` };
    }

    if (typeof filters.isActive === 'boolean') {
      where.isActive = filters.isActive;
    }

    return Stockroom.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']],
    });
  }

  async update(userId, id, data) {
    return Stockroom.update(data, { where: { id, id_user: userId } });
  }
}

export const stockroomRepository = new StockroomRepository();
