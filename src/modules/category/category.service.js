import { categoryRepository } from './category.repository.js';
import { buildPagination, buildMeta } from '../../utils/pagination.js';
import { BadRequestError, NotFoundError } from '../../errors/http.error.js';

const list = async (userId, query) => {
  const { page, perPage, name, isActive } = query;
  const pagination = buildPagination(page, perPage);

  const filters = {
    name,
    isActive:
      typeof isActive === 'string'
        ? isActive.toLowerCase() === 'true'
        : undefined,
  };

  const { rows, count } = await categoryRepository.findAllPaginated(
    userId,
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

const getById = async (userId, id) => {
  if (!id) throw new BadRequestError('Id is required');

  const supplier = await categoryRepository.findById(userId, id);
  if (!supplier) throw new NotFoundError('Supplier not found');

  return supplier;
};

export const categoryService = {
  list,
  getById
};
