import { stockroomService } from './stockroom.service.js';

const create = async (req, res, next) => {
  try {
    const stockroom = await stockroomService.create(req.body);
    return res.created(stockroom, 'Store created successfully');
  } catch (error) {
    return next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await stockroomService.list(req.query);
    return res.ok(result, 'Store retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const stockroom = await stockroomService.getById(req.params.id);
    return res.ok(stockroom, 'Store retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const stockroom = await stockroomService.update(req.params.id, req.body);
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
