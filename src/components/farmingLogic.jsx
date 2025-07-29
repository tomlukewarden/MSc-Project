import SeedPouchLogic from './seedPouchLogic';
import itemsData from '../items';


// Build a map from seed key/name to plantKey using itemsData
const seedToPlantMap = {};
if (Array.isArray(itemsData)) {
  itemsData.forEach(item => {
    if (item.type === 'seed' && item.plantKey) {
      seedToPlantMap[item.key] = item.plantKey;
      seedToPlantMap[item.name] = item.plantKey;
    }
  });
}

export class Plot {
  constructor() {
    this.state = 'empty'; 
    this.seedType = null;
    this.growthStage = 0;
    this.watered = false;
    this.waterCount = 0; // Number of days watered
    this.lastWateredDay = null; // Track last day watered
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
      this.waterCount = 0;
      this.lastWateredDay = null;
      return { success: true, message: `Planted ${this.seedType}.` };
    }
    // Remove non-stackable seed
    if (seedObj) {
      SeedPouchLogic.removeSeed(seedObj.key, 1);
      this.state = 'planted';
      this.seedType = seedObj.name || seedObj.type || seedObj.key;
      this.growthStage = 0;
      this.watered = false;
      this.waterCount = 0;
      this.lastWateredDay = null;
      return { success: true, message: `Planted ${this.seedType}.` };
    }
    return { success: false, message: `No ${normalizedSeedType.name || normalizedSeedType.type || normalizedSeedType.key} seeds in pouch.` };
  }

  water() {
    // Accept a day parameter for daily watering, or use globalTimeManager if available
    let currentDay = null;
    if (typeof window !== 'undefined' && window.globalTimeManager && window.globalTimeManager.getDayNumber) {
      currentDay = window.globalTimeManager.getDayNumber();
    }
    // If not available, fallback to incrementing
    if (currentDay === null) {
      currentDay = (this.lastWateredDay || 0) + 1;
    }
    console.log('[Plot.water] currentDay:', currentDay, 'lastWateredDay:', this.lastWateredDay);
    if (this.state === 'planted') {
      if (this.lastWateredDay === currentDay) {
        console.log('[Plot.water] Already watered today.');
        return { success: false, message: 'Already watered today.' };
      }
      this.watered = true;
      this.waterCount = (this.waterCount || 0) + 1;
      this.lastWateredDay = currentDay;
      if (this.waterCount >= 3) {
        this.state = 'grown';
      }
      console.log('[Plot.water] Watered. New lastWateredDay:', this.lastWateredDay);
      return { success: true, message: `Watered the plant. (${this.waterCount}/3)` };
    }
    console.log('[Plot.water] Cannot water now. State:', this.state);
    return { success: false, message: 'Cannot water now.' };
  }

  harvest() {
    if (this.state === 'grown') {
      this.state = 'harvested';
      // Use plantKey from itemsData for the harvested plant
      let plant = seedToPlantMap[this.seedType] || this.seedType;
      this.seedType = null;
      this.growthStage = 0;
      this.watered = false;
      this.waterCount = 0;
      this.lastWateredDay = null;
      return { success: true, item: plant, message: `Harvested ${plant}.` };
    }
    return { success: false, message: 'Not ready to harvest.' };
  }

  reset() {
    this.state = 'empty';
    this.seedType = null;
    this.growthStage = 0;
    this.watered = false;
    this.waterCount = 0;
    this.lastWateredDay = null;
  }
}
