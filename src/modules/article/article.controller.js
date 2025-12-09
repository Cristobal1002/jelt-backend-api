import { articleService } from './article.service.js';

const create = async (req, res, next) => {
  try {
    const article = await articleService.create(req.body);
    return res.created(article, 'Article created successfully');
  } catch (error) {
    return next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await articleService.list(req.query);
    // result = { items, meta }
    return res.ok(result, 'Articles retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const article = await articleService.getById(req.params.id);
    return res.ok(article, 'Article retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const article = await articleService.update(req.params.id, req.body);
    return res.ok(article, 'Article updated successfully');
  } catch (error) {
    return next(error);
  }
};

const softDelete = async (req, res, next) => {
  try {
    await articleService.softDelete(req.params.id);
    return res.ok({}, 'Article deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export const articleController = {
  create,
  list,
  getById,
  update,
  softDelete,
};
