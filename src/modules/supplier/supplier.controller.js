import { supplierService } from './supplier.service.js';

const create = async (req, res, next) => {
  try {
    const supplier = await supplierService.create(req.body);
    return res.created(supplier, 'Supplier created successfully');
  } catch (error) {
    return next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await supplierService.list(req.query);
    return res.ok(result, 'Suppliers retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const supplier = await supplierService.getById(req.params.id);
    return res.ok(supplier, 'Supplier retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const supplier = await supplierService.update(req.params.id, req.body);
    return res.ok(supplier, 'Supplier updated successfully');
  } catch (error) {
    return next(error);
  }
};

export const supplierController = {
  create,
  list,
  getById,
  update,
};
