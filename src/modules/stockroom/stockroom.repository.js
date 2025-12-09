import { Op } from 'sequelize';
import { Stockroom } from '../../models/stockroom.model.js';

class StockroomRepository {
  async create(data) {
    return Stockroom.create(data);
  }

  async findById(id) {
    return Stockroom.findByPk(id);
  }

  async findAllPaginated(filters, { limit, offset }) {
    const where = {};

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

  async update(id, data) {
    return Stockroom.update(data, { where: { id } });
  }
}

export const stockroomRepository = new StockroomRepository();
