import Phaser from 'phaser';
import SeedPouchLogic from './seedPouchLogic';

class OpenSeedPouch extends Phaser.Scene {
  constructor() {
    super({ key: 'OpenSeedPouch' });
    this.seedRects = [];
    this.seedTexts = [];
    this.seedImages = [];
  }
  preload() {
  this.load.image("pouchBackground", "/assets/ui-items/overlayBg.png");
}

  create(data) {
    const { width, height } = this.sys.game.config;

    // Use pouchBackground image instead of rectangle
    this.add.image(width / 2, height / 2, "pouchBackground")
      .setDisplaySize(420, 320)
      .setDepth(105)
      .setAlpha(0.95);

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
        // DON'T remove seeds here - just select the seed type
        if (typeof data.onSelect === 'function') {
          // Pass just the seed info, not the removal logic
          data.onSelect({
            key: seed.key,
            name: seed.name,
            // Don't pass the full count - let planting logic decide how many to use
          });
        }
        
        // Close the pouch immediately - let the planting scene handle the removal
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
