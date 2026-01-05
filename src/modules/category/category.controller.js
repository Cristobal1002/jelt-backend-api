import { categoryService } from './category.service.js';

const list = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const result = await categoryService.list(userId, req.query);
    return res.ok(result, 'Category retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const categories = await categoryService.getById(userId, req.params.id);
    return res.ok(categories, 'Category retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const categoryController = {
  list,
  getById
};
