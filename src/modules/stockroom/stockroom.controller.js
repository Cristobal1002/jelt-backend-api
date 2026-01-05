import { stockroomService } from './stockroom.service.js';

const create = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const stockroom = await stockroomService.create(userId, req.body);
    return res.created(stockroom, 'Store created successfully');
  } catch (error) {
    return next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const result = await stockroomService.list(userId, req.query);
    return res.ok(result, 'Store retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const stockroom = await stockroomService.getById(userId, req.params.id);
    return res.ok(stockroom, 'Store retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const stockroom = await stockroomService.update(userId, req.params.id, req.body);
    return res.ok(stockroom, 'Store updated successfully');
  } catch (error) {
    return next(error);
  }
};

export const stockroomController = {
  create,
  list,
  getById,
  update,
};
