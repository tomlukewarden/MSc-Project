import DayCycle from './dayCycle';

// Singleton GlobalTimeManager
class GlobalTimeManager {
  constructor() {
    this.scene = null;
    this.dayCycle = null;
    this.totalDuration = 2000; 
    this.stageCount = 4;
    this.stageDuration = this.totalDuration / this.stageCount;
    this.stages = ['morning', 'midday', 'afternoon', 'evening'];
    this.startTimestamp = null;
    this.onStageChange = null;
    this.lastStage = null;
    this.currentDay = 1;
  }

  init(scene, options = {}) {
    this.scene = scene;
    this.dayCycle = new DayCycle(scene);
    if (options.totalDuration) this.totalDuration = options.totalDuration;
    this.stageDuration = this.totalDuration / this.stageCount;
    if (options.onStageChange) this.onStageChange = options.onStageChange;
    const stage = this.getCurrentStage();
    this.dayCycle.setTimeOfDay(this.stages[stage]);
  }

  start() {
    if (!this.startTimestamp) {
      this.startTimestamp = Date.now();
    }
    if (this.scene && this.scene.time) {
      this.scene.time.addEvent({
        delay: 2000,
        loop: true,
        callback: () => {
          const stage = this.getCurrentStage();
          if (stage !== this.lastStage) {
            this.dayCycle.setTimeOfDay(this.stages[stage]);
            if (this.onStageChange) this.onStageChange(this.stages[stage]);
            this.lastStage = stage;
          }
        }
      });
    }
  }

  nextDay() {
    this.currentDay += 1;
    this.startTimestamp = Date.now();
    
    this.lastStage = null;
    if (this.dayCycle) {
      this.dayCycle.setTimeOfDay(this.stages[0]);
    }
  }

  getDayNumber() {
    return this.currentDay;
  }

  stop() {
    this.startTimestamp = null;
    this.lastStage = null;
  }

  getCurrentStage() {
    if (!this.startTimestamp) return 0;
    const elapsed = (Date.now() - this.startTimestamp) / 1000;
    let stage = Math.floor(elapsed / this.stageDuration);
    if (stage >= this.stageCount) stage = this.stageCount - 1;
    return stage;
  }

  getCurrentTimeOfDay() {
    return this.stages[this.getCurrentStage()];
  }
}

const globalTimeManager = new GlobalTimeManager();
export default globalTimeManager;
