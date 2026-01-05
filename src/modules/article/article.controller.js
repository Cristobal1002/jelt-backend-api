import { articleService } from './article.service.js';

const create = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const article = await articleService.create(userId, req.body);
    return res.created(article, 'Article created successfully');
  } catch (error) {
    return next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await articleService.list(userId, req.query);
    // result = { items, meta }
    return res.ok(result, 'Articles retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const article = await articleService.getById(userId, req.params.id);
    return res.ok(article, 'Article retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const article = await articleService.update(userId, req.params.id, req.body);
    return res.ok(article, 'Article updated successfully');
  } catch (error) {
    return next(error);
  }
};

const softDelete = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await articleService.softDelete(userId, req.params.id);
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
