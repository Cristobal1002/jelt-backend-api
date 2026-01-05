import { inventoryHistoryRepository } from './inventory-history.repository.js';

class InventoryHistoryService {
  async createSale(userId, payload) {
    return inventoryHistoryRepository.createSale(userId, payload);
  }

  async listSales(userId, query) {
    return inventoryHistoryRepository.listSales(userId, query);
  }

  async salesSummary(userId, query) {
    return inventoryHistoryRepository.getSalesSummary(userId, query);
  }

  async topSelling(userId, query) {
    return inventoryHistoryRepository.getTopSellingArticles(userId, query);
  }

  async createMovement(userId, payload) {
    return inventoryHistoryRepository.createMovement(userId, payload);
  }

  async listMovements(userId, query) {
    return inventoryHistoryRepository.listMovements(userId, query);
  }

  async movementSummary(userId, query) {
    return inventoryHistoryRepository.getMovementSummary(userId, query);
  }
}

export const inventoryHistoryService = new InventoryHistoryService();
