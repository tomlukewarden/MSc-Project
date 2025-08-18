import SeedPouchLogic from '../logicHandlers/seedPouchLogic';
import itemsData from '../gameData/items';
import globalTimeManager from '../stateManagers/timeManager';
import { receivedItem } from './recievedItem';


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

// Map plant keys to their grown image keys
const grownImages = {
  foxglovePlant: 'foxglovePlant',      // Use your actual image key for grown foxglove
  marigoldPlant: 'marigoldPlant',
  jasminePlant: 'jasminePlant',
  aloePlant: 'aloePlant',
  lavenderPlant: 'lavenderPlant',
  periwinklePlant: 'periwinklePlant',
  garlicPlant: 'garlicPlant',
  thymePlant: 'thymePlant',
  willowPlant: 'willowPlant'
};

export class Plot {
  constructor() {
    this.state = 'empty'; 
    this.seedType = null;
    this.growthStage = 0;
    this.watered = false;
    this.waterCount = 0; 
    this.lastWateredDay = null;
    this.stageImage = null;
  }

  // Helper to get the image key for the current stage
  getStageImageKey() {
    switch (this.state) {
      case 'empty':
        return 'plotEmptyImg'; 
      case 'prepared':
        return 'plotPreparedImg'; 
      case 'planted':
        return 'plotPlantedImg'; 
      case 'watered':
        return 'plotWateredImg';
      case 'grown':
        // Show the plant image when grown
        return grownImages[this.seedType] || 'plotGrownImg';
      case 'harvested':
        return 'plotHarvestedImg'; 
      default:
        return null;
    }
  }

  prepare() {
    if (this.state === 'empty') {
      this.state = 'prepared';
      this.stageImage = this.getStageImageKey();
      return { success: true, message: 'Ground prepared.' };
    }
    return { success: false, message: 'Already prepared or not empty.' };
  }

  plant(seedType) {
    if (this.state !== 'prepared') {
      return { success: false, message: 'Ground not prepared.' };
    }
    let normalizedSeedType = typeof seedType === 'string'
      ? SeedPouchLogic.getSeeds().find(item => item.name === seedType || item.type === seedType || item.key === seedType)
      : seedType;
    if (!normalizedSeedType) {
      return { success: false, message: `No ${typeof seedType === 'string' ? seedType : (seedType.name || seedType.type || seedType.key)} seeds in pouch.` };
    }
    const isSeedMatch = (item) => {
      if (!item) return false;
      return item.name === normalizedSeedType.name || item.type === normalizedSeedType.type || item.key === normalizedSeedType.key;
    };
    let seedIdx = SeedPouchLogic.getSeeds().findIndex(isSeedMatch);
    let seedObj = seedIdx !== -1 ? SeedPouchLogic.getSeeds()[seedIdx] : null;
    if (seedObj && seedObj.count && seedObj.count > 0) {
      SeedPouchLogic.removeSeed(seedObj.key, 1);
      this.state = 'planted';
      this.stageImage = this.getStageImageKey();
      this.seedType = seedObj.key; // Use key for grownImages lookup
      this.growthStage = 0;
      this.watered = false;
      this.waterCount = 0;
      this.lastWateredDay = null;
      return { success: true, message: `Planted ${this.seedType}.` };
    }
    if (seedObj) {
      SeedPouchLogic.removeSeed(seedObj.key, 1);
      this.state = 'planted';
      this.stageImage = this.getStageImageKey();
      this.seedType = seedObj.key;
      this.growthStage = 0;
      this.watered = false;
      this.waterCount = 0;
      this.lastWateredDay = null;
      return { success: true, message: `Planted ${this.seedType}.` };
    }
    return { success: false, message: `No ${normalizedSeedType.name || normalizedSeedType.type || normalizedSeedType.key} seeds in pouch.` };
  }

  water() {
    let currentDay = globalTimeManager.getDayNumber();
    if (this.state === 'planted') {
      if (this.lastWateredDay === null || currentDay > this.lastWateredDay) {
        this.watered = true;
        this.waterCount = (this.waterCount || 0) + 1;
        this.lastWateredDay = currentDay;
        if (this.waterCount >= 3) {
          this.state = 'grown';
          this.stageImage = this.getStageImageKey();
        }
        return { success: true, message: `Watered the plant. (${this.waterCount}/3)` };
      } else {
        return { success: true, message: 'Watered again, but only one watering per day counts towards growth.' };
      }
    }
    return { success: false, message: 'Cannot water now.' };
  }

  harvest() {
    if (this.state === 'grown') {
      this.state = 'harvested';
      this.stageImage = this.getStageImageKey();
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
    this.stageImage = this.getStageImageKey();
    this.seedType = null;
    this.growthStage = 0;
    this.watered = false;
    this.waterCount = 0;
    this.lastWateredDay = null;
  }
}
