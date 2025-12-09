import { articleRepository } from './article.repository.js';
import { buildPagination, buildMeta } from '../../utils/pagination.js';
import { BadRequestError, NotFoundError } from '../../errors/http.error.js';

const create = async (data) => {
  // Todas las validaciones de formato se hacen en el validator
  const article = await articleRepository.create(data);
  return article;
};

const list = async (query) => {
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
  if (!id) {
    throw new BadRequestError('Id is required');
  }

  const article = await articleRepository.findById(id);
  if (!article) {
    throw new NotFoundError('Article not found');
  }

  return article;
};

const update = async (id, data) => {
  if (!id) {
    throw new BadRequestError('Id is required');
  }

  const [affected] = await articleRepository.update(id, data);
  if (!affected) {
    throw new NotFoundError('Article not found');
  }

  return articleRepository.findById(id);
};

const softDelete = async (id) => {
  if (!id) {
    throw new BadRequestError('Id is required');
  }

  const [affected] = await articleRepository.softDelete(id);
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
