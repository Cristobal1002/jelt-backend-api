import { articleRepository } from './article.repository.js';
import { buildPagination, buildMeta } from '../../utils/pagination.js';
import { BadRequestError, NotFoundError } from '../../errors/http.error.js';

const create = async (userId, data) => {
  // Todas las validaciones de formato se hacen en el validator
  if (!userId) {
    throw new BadRequestError('Action denied for user');
  }

  const article = await articleRepository.create(userId, data);

  return article;
};

const list = async (userId, query) => {
  if (!userId) {
    throw new BadRequestError('Action denied for user');
  }

  const { page, perPage, id, sku, name, priceGt, priceLt, priceMin, priceMax } =
    query;

  const pagination = buildPagination(page, perPage);

  const filters = {
    id,
    sku,
    name,
    priceGt: priceGt != null ? Number(priceGt) : undefined,
    priceLt: priceLt != null ? Number(priceLt) : undefined,
    priceMin: priceMin != null ? Number(priceMin) : undefined,
    priceMax: priceMax != null ? Number(priceMax) : undefined,
  };

  const { rows, count } = await articleRepository.findAllPaginated(
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
  if (!userId) {
    throw new BadRequestError('Action denied for user');
  }

  if (!id) {
    throw new BadRequestError('Id is required');
  }

  const article = await articleRepository.findById(userId, id);
  if (!article) {
    throw new NotFoundError('Article not found');
  }

  return article;
};

const update = async (userId, id, data) => {
  if (!userId) {
    throw new BadRequestError('Action denied for user');
  }

  if (!id) {
    throw new BadRequestError('Id is required');
  }

  const [affected] = await articleRepository.update(userId, id, data);
  if (!affected) {
    throw new NotFoundError('Article not found');
  }

  return articleRepository.findById(userId, id);
};

const softDelete = async (userId, id) => {
  if (!userId) {
    throw new BadRequestError('Action denied for user');
  }

  if (!id) {
    throw new BadRequestError('Id is required');
  }

  const [affected] = await articleRepository.softDelete(userId, id);
  if (!affected) {
    throw new NotFoundError('Article not found');
  }
};

export const articleService = {
  create,
  list,
  getById,
  update,
  softDelete,
};
