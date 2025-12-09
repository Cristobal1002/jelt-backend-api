import { supplierRepository } from './supplier.repository.js';
import { buildPagination, buildMeta } from '../../utils/pagination.js';
import { BadRequestError, NotFoundError } from '../../errors/http.error.js';

const create = async (data) => {
  return supplierRepository.create(data);
};

const list = async (query) => {
  const { page, perPage, name, nit, isActive } = query;
  const pagination = buildPagination(page, perPage);

  const filters = {
    name,
    nit,
    isActive:
      typeof isActive === 'string'
        ? isActive.toLowerCase() === 'true'
        : undefined,
  };

  const { rows, count } = await supplierRepository.findAllPaginated(
    filters,
    pagination
  );

  return {
    items: rows,
    meta: buildMeta({
      count,
      limit: pagination.limit,
      currentPage: pagination.currentPage,
    }),
  };
};

const getById = async (id) => {
  if (!id) throw new BadRequestError('Id is required');

  const supplier = await supplierRepository.findById(id);
  if (!supplier) throw new NotFoundError('Supplier not found');

  return supplier;
};

const update = async (id, data) => {
  if (!id) throw new BadRequestError('Id is required');

  const [affected] = await supplierRepository.update(id, data);
  if (!affected) throw new NotFoundError('Supplier not found');

  return supplierRepository.findById(id);
};

export const supplierService = {
  create,
  list,
  getById,
  update,
};
