import { Op } from 'sequelize';
import { Supplier } from '../../models/supplier.model.js';

class SupplierRepository {
  async create(data) {
    return Supplier.create(data);
  }

  async findById(id) {
    return Supplier.findByPk(id);
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

    return Supplier.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']],
    });
  }

  async update(id, data) {
    return Supplier.update(data, { where: { id } });
  }
}

export const supplierRepository = new SupplierRepository();
