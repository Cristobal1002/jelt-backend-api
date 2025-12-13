import { categoryRepository } from './category.repository.js';
import { buildPagination, buildMeta } from '../../utils/pagination.js';
import { BadRequestError, NotFoundError } from '../../errors/http.error.js';

const list = async (query) => {
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

  const category = await categoryRepository.findById(id);
  if (!category) throw new NotFoundError('Category not found');

  return category;
};

const create = async (data) => {
  const { name, description, isActive } = data;

  if (!name) {
    throw new BadRequestError('Name is required');
  }

  const category = await categoryRepository.create({
    name,
    description: description || null,
    isActive: isActive !== undefined ? isActive : true,
  });

  return category;
};

export const categoryService = {
  list,
  getById,
  create
};
