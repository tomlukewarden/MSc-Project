// Farming logic for planting, preparing, watering, and harvesting

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
    if (this.state === 'prepared') {
      this.state = 'planted';
      this.seedType = seedType;
      this.growthStage = 0;
      this.watered = false;
      return { success: true, message: `Planted ${seedType}.` };
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

// Example usage:
// const plot = new Plot();
// plot.prepare();
// plot.plant('carrotSeed');
// plot.water();
// plot.water();
// plot.harvest();
