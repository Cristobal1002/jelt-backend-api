import { inventoryHistoryRepository } from './inventory-history.repository.js';

class InventoryHistoryService {
  async createSale(payload) {
    return inventoryHistoryRepository.createSale(payload);
  }

  async listSales(query) {
    return inventoryHistoryRepository.listSales(query);
  }

  async salesSummary(query) {
    return inventoryHistoryRepository.getSalesSummary(query);
  }

  async topSelling(query) {
    return inventoryHistoryRepository.getTopSellingArticles(query);
  }

  async createMovement(payload) {
    return inventoryHistoryRepository.createMovement(payload);
  }

  async listMovements(query) {
    return inventoryHistoryRepository.listMovements(query);
  }

  async movementSummary(query) {
    return inventoryHistoryRepository.getMovementSummary(query);
  }
}

export const inventoryHistoryService = new InventoryHistoryService();
