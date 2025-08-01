import Phaser from 'phaser';
import SeedPouchLogic from './seedPouchLogic';

class OpenSeedPouch extends Phaser.Scene {
  constructor() {
    super({ key: 'OpenSeedPouch' });
    this.seedRects = [];
    this.seedTexts = [];
    this.seedImages = [];
  }

  create(data) {
    const { width, height } = this.sys.game.config;
    this.add.rectangle(width / 2, height / 2, 420, 320, 0x567d46)
      .setStrokeStyle(4, 0x3e2f1c)
      .setAlpha(0.95)
      .setDepth(105);

    this.add.text(width / 2, height / 2 - 120, 'Seed Pouch', {
      fontFamily: 'Georgia',
      fontSize: '32px',
      color: '#fff'
    }).setOrigin(0.5).setDepth(106);

    // Get seeds from SeedPouchLogic
    const seedPouch = SeedPouchLogic.getSeeds();
    // Render seeds in a grid
    const cols = 4;
    const rows = Math.ceil(seedPouch.length / cols);
    const cellW = 100;
    const cellH = 110;
    const gridW = cols * cellW;
    const gridH = rows * cellH;
    const startX = width / 2 - gridW / 2 + cellW / 2;
    const startY = height / 2 - gridH / 2 + cellH / 2 + 20;
    seedPouch.forEach((seed, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;

      const rect = this.add.rectangle(
        x, y, 90, 90, 0xd2b48c
      ).setStrokeStyle(3, 0x3e2f1c).setDepth(106).setInteractive();

      let img = null;
      if (seed.key && this.textures.exists(seed.key)) {
        img = this.add.image(x, y - 10, seed.key)
          .setDisplaySize(60, 60)
          .setDepth(107);
        this.seedImages.push(img);
      }

      const nameText = this.add.text(
        x, y - 38, seed.name + (seed.count > 1 ? ` x${seed.count}` : ''), {
          fontFamily: 'Georgia',
          fontSize: '16px',
          color: '#222',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5).setDepth(108);

      rect.on('pointerdown', () => {
        // Select seed, decrement count, and close pouch
        if (typeof data.onSelect === 'function') {
          data.onSelect(seed);
        }
        SeedPouchLogic.removeSeed(seed.key, 1);
        this.scene.stop();
      });

      this.seedRects.push(rect);
      this.seedTexts.push(nameText);
    // Clean up on shutdown/destroy
    this.events.on('shutdown', () => {
      this.seedRects.forEach(r => r && !r.destroyed && r.destroy());
      this.seedTexts.forEach(t => t && !t.destroyed && t.destroy());
      this.seedImages.forEach(img => img && !img.destroyed && img.destroy());
    });
    this.events.on('destroy', () => {
      this.seedRects.forEach(r => r && !r.destroyed && r.destroy());
      this.seedTexts.forEach(t => t && !t.destroyed && t.destroy());
      this.seedImages.forEach(img => img && !img.destroyed && img.destroy());
    });
    });

    // Click anywhere else to exit pouch
    this.input.once('pointerdown', (pointer, currentlyOver) => {
      if (!currentlyOver.length) {
        this.scene.stop('OpenSeedPouch');
      }
    });
  }
}

export default OpenSeedPouch;
