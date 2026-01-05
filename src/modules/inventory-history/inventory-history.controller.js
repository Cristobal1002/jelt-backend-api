import { inventoryHistoryService } from './inventory-history.service.js';

class InventoryHistoryController {
  // Sales
  createSale = async (req, res, next) => {
    try {
      const userId = req.user?.id || null;
      const sale = await inventoryHistoryService.createSale(userId, req.body);
      res.status(201).json(sale);
    } catch (err) {
      next(err);
    }
  };

  listSales = async (req, res, next) => {
    try {
      const userId = req.user?.id || null;
      const data = await inventoryHistoryService.listSales(userId, req.query);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  salesSummary = async (req, res, next) => {
    try {
      const userId = req.user?.id || null;
      const data = await inventoryHistoryService.salesSummary(userId, req.query);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  topSelling = async (req, res, next) => {
    try {
      const userId = req.user?.id || null;
      const data = await inventoryHistoryService.topSelling(userId, req.query);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  // Movements
  createMovement = async (req, res, next) => {
    try {
      const userId = req.user?.id || null;
      const mov = await inventoryHistoryService.createMovement(userId, req.body);
      res.status(201).json(mov);
    } catch (err) {
      next(err);
    }
  };

  listMovements = async (req, res, next) => {
    try {
      const userId = req.user?.id || null;
      const data = await inventoryHistoryService.listMovements(userId, req.query);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  movementSummary = async (req, res, next) => {
    try {
      const userId = req.user?.id || null;
      const data = await inventoryHistoryService.movementSummary(userId, req.query);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}

export const inventoryHistoryController = new InventoryHistoryController();
