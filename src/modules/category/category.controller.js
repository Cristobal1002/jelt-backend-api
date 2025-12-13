import { categoryService } from './category.service.js';

const list = async (req, res, next) => {
  try {
    const result = await categoryService.list(req.query);
    return res.ok(result, 'Category retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const categories = await categoryService.getById(req.params.id);
    return res.ok(categories, 'Category retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const category = await categoryService.create(req.body);
    return res.created(category, 'Category created successfully');
  } catch (error) {
    return next(error);
  }
};

export const categoryController = {
  list,
  getById,
  create
};
