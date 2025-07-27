export class Plot {
  constructor() {
    this.state = 'empty'; 
    this.seedType = null;
    this.growthStage = 0;
    this.watered = false;
  }

  prepare() {
    if (this.state === 'empty') {
      this.state = 'prepared';
      return { success: true, message: 'Ground prepared.' };
    }
    return { success: false, message: 'Already prepared or not empty.' };
  }

  plant(seedType) {
    // Accept seeds from inventoryManager
    if (this.state !== 'prepared') {
      return { success: false, message: 'Ground not prepared.' };
    }
    // Check global inventoryManager for seeds
    let inventoryManager = typeof window !== 'undefined' ? window.inventoryManager : null;
    if (!inventoryManager || !inventoryManager.getInventory) {
      return { success: false, message: 'Inventory not available.' };
    }
    const inventory = inventoryManager.getInventory();
    // Always normalize seedType to object for robust matching
    let normalizedSeedType = typeof seedType === 'string'
      ? (Array.isArray(inventory.items) ? inventory.items.find(item => item.name === seedType || item.type === seedType || item.key === seedType) : null)
      : seedType;
    if (!normalizedSeedType) {
      // Try tools array if not found in items
      normalizedSeedType = typeof seedType === 'string'
        ? (Array.isArray(inventory.tools) ? inventory.tools.find(item => item.name === seedType || item.type === seedType || item.key === seedType) : null)
        : seedType;
    }
    if (!normalizedSeedType) {
      return { success: false, message: `No ${typeof seedType === 'string' ? seedType : (seedType.name || seedType.type || seedType.key)} seeds in inventory.` };
    }
    // Find seed in items array
    const isSeedMatch = (item) => {
      if (!item) return false;
      return item.name === normalizedSeedType.name || item.type === normalizedSeedType.type || item.key === normalizedSeedType.key;
    };
    let seedIdx = Array.isArray(inventory.items) ? inventory.items.findIndex(isSeedMatch) : -1;
    let seedObj = seedIdx !== -1 ? inventory.items[seedIdx] : null;
    // Support stackable seeds
    if (seedObj && seedObj.count && seedObj.count > 0) {
      seedObj.count--;
      if (seedObj.count === 0) inventory.items.splice(seedIdx, 1);
      this.state = 'planted';
      this.seedType = seedObj.name || seedObj.type || seedObj.key;
      this.growthStage = 0;
      this.watered = false;
      return { success: true, message: `Planted ${this.seedType}.` };
    }
    // Remove non-stackable seed
    if (seedObj) {
      inventory.items.splice(seedIdx, 1);
      this.state = 'planted';
      this.seedType = seedObj.name || seedObj.type || seedObj.key;
      this.growthStage = 0;
      this.watered = false;
      return { success: true, message: `Planted ${this.seedType}.` };
    }
    // Check tools array for seeds
    let toolIdx = Array.isArray(inventory.tools) ? inventory.tools.findIndex(isSeedMatch) : -1;
    if (toolIdx !== -1) {
      inventory.tools.splice(toolIdx, 1);
      this.state = 'planted';
      this.seedType = normalizedSeedType.name || normalizedSeedType.type || normalizedSeedType.key;
      this.growthStage = 0;
      this.watered = false;
      return { success: true, message: `Planted ${this.seedType}.` };
    }
    return { success: false, message: `No ${normalizedSeedType.name || normalizedSeedType.type || normalizedSeedType.key} seeds in inventory.` };
  }

  water() {
    if (this.state === 'planted' && !this.watered) {
      this.watered = true;
      this.growthStage++;
      if (this.growthStage >= 2) {
        this.state = 'grown';
      }
      return { success: true, message: 'Watered the plant.' };
    }
    return { success: false, message: 'Cannot water now.' };
  }

  harvest() {
    if (this.state === 'grown') {
      this.state = 'harvested';
      const harvested = this.seedType;
      this.seedType = null;
      this.growthStage = 0;
      this.watered = false;
      return { success: true, item: harvested, message: `Harvested ${harvested}.` };
    }
    return { success: false, message: 'Not ready to harvest.' };
  }

  reset() {
    this.state = 'empty';
    this.seedType = null;
    this.growthStage = 0;
    this.watered = false;
  }
}
