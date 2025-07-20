
class DayCycle {
  constructor(scene) {
    this.scene = scene;
    this.overlay = null;
    this.currentTime = 'morning';
  }

  setTimeOfDay(time) {
    this.currentTime = time;
    if (this.overlay) {
      this.overlay.destroy();
      this.overlay = null;
    }
    const { width, height } = this.scene.sys.game.config;
    if (time === 'midday') {
      return;
    }
    if (time === 'evening') {
      // Blue overlay
      this.overlay = this.scene.add.rectangle(
        width / 2,
        height / 2,
        width,
        height,
        0x223366,
        0.35
      ).setDepth(9999);
    } else if (time === 'afternoon') {
      // Orange overlay
      this.overlay = this.scene.add.rectangle(
        width / 2,
        height / 2,
        width,
        height,
        0xffa500,
        0.18
      ).setDepth(9999);
    }
  }

  // Optionally, advance time (morning -> midday -> afternoon -> evening)
  advanceTime() {
    const order = ['morning', 'midday', 'afternoon', 'evening'];
    const idx = order.indexOf(this.currentTime);
    const next = order[(idx + 1) % order.length];
    this.setTimeOfDay(next);
  }
}

export default DayCycle;
