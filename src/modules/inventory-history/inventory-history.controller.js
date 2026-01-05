import { inventoryHistoryService } from './inventory-history.service.js';

class InventoryHistoryController {
  // Sales
  createSale = async (req, res, next) => {
    try {
      const sale = await inventoryHistoryService.createSale(req.body);
      res.status(201).json(sale);
    } catch (err) {
      next(err);
    }
  };

  listSales = async (req, res, next) => {
    try {
      const data = await inventoryHistoryService.listSales(req.query);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  salesSummary = async (req, res, next) => {
    try {
      const data = await inventoryHistoryService.salesSummary(req.query);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  topSelling = async (req, res, next) => {
    try {
      const data = await inventoryHistoryService.topSelling(req.query);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  // Movements
  createMovement = async (req, res, next) => {
    try {
      const mov = await inventoryHistoryService.createMovement(req.body);
      res.status(201).json(mov);
    } catch (err) {
      next(err);
    }
  };

  listMovements = async (req, res, next) => {
    try {
      const data = await inventoryHistoryService.listMovements(req.query);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  movementSummary = async (req, res, next) => {
    try {
      const data = await inventoryHistoryService.movementSummary(req.query);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}

export const inventoryHistoryController = new InventoryHistoryController();
