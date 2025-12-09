import { stockroomRepository } from './stockroom.repository.js';
import { buildPagination, buildMeta } from '../../utils/pagination.js';
import { BadRequestError, NotFoundError } from '../../errors/http.error.js';

const create = async (data) => {
  return stockroomRepository.create(data);
};

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

  const { rows, count } = await stockroomRepository.findAllPaginated(
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

  const data = await stockroomRepository.findById(id);
  if (!data) throw new NotFoundError('Controller not found');

  return data;
};

const update = async (id, data) => {
  if (!id) throw new BadRequestError('Id is required');

  const [affected] = await stockroomRepository.update(id, data);
  if (!affected) throw new NotFoundError('Controller not found');

  return stockroomRepository.findById(id);
};

export const stockroomService = {
  create,
  list,
  getById,
  update,
};
