

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
    if (this.state === 'prepared') {
      // Check global inventoryManager for seeds
      let inventoryManager = typeof window !== 'undefined' ? window.inventoryManager : null;
      if (inventoryManager && inventoryManager.getInventory) {
        const inventory = inventoryManager.getInventory();
        // Seeds can be stored as items or tools, check both
        let seedIndex = -1;
        if (Array.isArray(inventory.items)) {
          seedIndex = inventory.items.findIndex(item => item === seedType || (item?.type === seedType));
        }
        if (seedIndex === -1 && Array.isArray(inventory.tools)) {
          seedIndex = inventory.tools.findIndex(tool => tool === seedType);
        }
        if (seedIndex !== -1) {
          // Remove one seed from items or tools
          if (Array.isArray(inventory.items) && inventory.items[seedIndex] === seedType) {
            inventory.items.splice(seedIndex, 1);
          } else if (Array.isArray(inventory.items) && inventory.items[seedIndex]?.type === seedType) {
            inventory.items.splice(seedIndex, 1);
          } else if (Array.isArray(inventory.tools) && inventory.tools[seedIndex] === seedType) {
            inventory.tools.splice(seedIndex, 1);
          }
          this.state = 'planted';
          this.seedType = seedType;
          this.growthStage = 0;
          this.watered = false;
          return { success: true, message: `Planted ${seedType}.` };
        } else {
          return { success: false, message: `No ${seedType} seeds in inventory.` };
        }
      } else {
        return { success: false, message: 'Inventory not available.' };
      }
    }
    return { success: false, message: 'Ground not prepared.' };
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
