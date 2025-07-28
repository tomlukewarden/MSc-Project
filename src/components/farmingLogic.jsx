import SeedPouchLogic from './seedPouchLogic';

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
    // Accept seeds from seed pouch
    if (this.state !== 'prepared') {
      return { success: false, message: 'Ground not prepared.' };
    }
    // Normalize seedType to object for robust matching
    let normalizedSeedType = typeof seedType === 'string'
      ? SeedPouchLogic.getSeeds().find(item => item.name === seedType || item.type === seedType || item.key === seedType)
      : seedType;
    if (!normalizedSeedType) {
      return { success: false, message: `No ${typeof seedType === 'string' ? seedType : (seedType.name || seedType.type || seedType.key)} seeds in pouch.` };
    }
    // Find seed in pouch
    const isSeedMatch = (item) => {
      if (!item) return false;
      return item.name === normalizedSeedType.name || item.type === normalizedSeedType.type || item.key === normalizedSeedType.key;
    };
    let seedIdx = SeedPouchLogic.getSeeds().findIndex(isSeedMatch);
    let seedObj = seedIdx !== -1 ? SeedPouchLogic.getSeeds()[seedIdx] : null;
    // Support stackable seeds
    if (seedObj && seedObj.count && seedObj.count > 0) {
      SeedPouchLogic.removeSeed(seedObj.key, 1);
      this.state = 'planted';
      this.seedType = seedObj.name || seedObj.type || seedObj.key;
      this.growthStage = 0;
      this.watered = false;
      return { success: true, message: `Planted ${this.seedType}.` };
    }
    // Remove non-stackable seed
    if (seedObj) {
      SeedPouchLogic.removeSeed(seedObj.key, 1);
      this.state = 'planted';
      this.seedType = seedObj.name || seedObj.type || seedObj.key;
      this.growthStage = 0;
      this.watered = false;
      return { success: true, message: `Planted ${this.seedType}.` };
    }
    return { success: false, message: `No ${normalizedSeedType.name || normalizedSeedType.type || normalizedSeedType.key} seeds in pouch.` };
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
