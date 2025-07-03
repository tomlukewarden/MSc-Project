import { createButterfly } from '../../characters/butterfly';
import Phaser from 'phaser';

class WallGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WallGardenScene' });
  }

  preload() {
    this.load.image('wallGardenBackground', '/assets/backgrounds/wallGarden/wallGarden.png');
  }

  create() {
    // --- Map and background ---
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;
    this.add.image(width / 2, height / 2, "wallGardenBackground").setScale(scaleFactor);
  }
}

export default WallGardenScene;