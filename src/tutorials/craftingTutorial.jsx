import Phaser from 'phaser';

class CraftingTutorial extends Phaser.Scene {
  constructor() {
    super({ key: 'CraftingTutorial' });
    this.inventory = [
      { key: 'marigoldPlant', name: 'Marigold', count: 2 },
      { key: 'baseCream', name: 'Base Cream', count: 1 }
    ];
    this.craftingSlots = [null, null, null];
    this.result = null;
  }

  preload() {
    this.load.image('personalGardenBg', '/assets/backgrounds/personal/personalBackground.png');
    this.load.image('craftingBench', '/assets/crafting/bench.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
    this.load.image('baseCream', '/assets/shopItems/cream.png');
    this.load.image('arrow', '/assets/ui-items/arrow.png');
    this.load.image('marigoldSalve', '/assets/crafting/creamRemedy.png');
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background
    this.add.image(width / 2, height / 2, 'personalGardenBg')
      .setDisplaySize(width, height)
      .setDepth(0);

    // Overlay
    this.add.rectangle(width / 2, height / 2, width - 80, height - 80, 0xffffff, 0.85)
      .setStrokeStyle(2, 0x228B22)
      .setDepth(1);

    // Title
    this.add.text(width / 2, 80, 'Crafting Tutorial', {
      fontFamily: 'Georgia',
      fontSize: '38px',
      color: '#228B22',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // Inventory display
    this.inventorySprites = [];
    this.add.text(width / 2 - 220, 160, 'Inventory:', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#333'
    }).setOrigin(0, 0.5).setDepth(2);

    // Space out inventory items and size them down
    const invStartX = width / 2 - 180;
    const invSpacing = 300;
    const invScale = 0.07;
    this.inventory.forEach((item, idx) => {
      const x = invStartX + idx * invSpacing;
      const y = 210;
      const sprite = this.add.image(x, y, item.key)
        .setScale(invScale)
        .setDepth(2)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(x, y + 38, `${item.name} x${item.count}`, {
        fontFamily: 'Georgia',
        fontSize: '16px',
        color: '#333'
      }).setOrigin(0.5).setDepth(2);

      sprite.on('pointerdown', () => {
        // Find first empty crafting slot
        const slotIdx = this.craftingSlots.findIndex(s => !s);
        if (slotIdx !== -1 && item.count > 0) {
          this.craftingSlots[slotIdx] = { ...item, key: item.key, name: item.name };
          item.count -= 1;
          label.setText(`${item.name} x${item.count}`);
          this.updateCraftingSlots();
        }
      });

      this.inventorySprites.push({ sprite, label });
    });

    // Crafting slots display
    this.craftingSlotSprites = [];
    this.add.text(width / 2, 300, 'Crafting Slots:', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#333'
    }).setOrigin(0.5).setDepth(2);

    // Space out crafting slots and size items down
    const slotY = 350;
    const slotStartX = width / 2 - 100;
    const slotSpacing = 100;
    const slotScale = 0.09;
    for (let i = 0; i < 3; i++) {
      const x = slotStartX + i * slotSpacing;
      const slotRect = this.add.rectangle(x, slotY, 60, 60, 0xffffff, 1)
        .setStrokeStyle(2, 0x228B22)
        .setDepth(2);
      this.craftingSlotSprites.push({ rect: slotRect, image: null, label: null });

      slotRect.setInteractive({ useHandCursor: true });
      slotRect.on('pointerdown', () => {
        // Remove item from slot and return to inventory
        if (this.craftingSlots[i]) {
          const invItem = this.inventory.find(it => it.key === this.craftingSlots[i].key);
          if (invItem) {
            invItem.count += 1;
            const invSprite = this.inventorySprites.find(s => s.sprite.texture.key === invItem.key);
            if (invSprite) {
              invSprite.label.setText(`${invItem.name} x${invItem.count}`);
            }
          }
          this.craftingSlots[i] = null;
          this.updateCraftingSlots();
        }
      });
    }

    // Craft button
    this.craftBtn = this.add.text(width / 2, slotY + 80, 'Craft!', {
      fontFamily: 'Georgia',
      fontSize: '26px',
      color: '#fff',
      backgroundColor: '#228B22',
      padding: { left: 18, right: 18, top: 8, bottom: 8 }
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true });

    this.craftBtn.on('pointerdown', () => {
      this.tryCraft();
    });

    // Result display
    this.resultImage = null;
    this.resultLabel = null;

    // Back button
    const backBtn = this.add.text(width / 2, height - 60, "Back", {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#fff",
      backgroundColor: "#228B22",
      padding: { left: 18, right: 18, top: 8, bottom: 8 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => backBtn.setStyle({ backgroundColor: "#145214" }))
      .on("pointerout", () => backBtn.setStyle({ backgroundColor: "#228B22" }))
      .on("pointerdown", () => {
        this.scene.start("PersonalGarden");
      });

    // Initial crafting slots update
    this.updateCraftingSlots();
  }

  updateCraftingSlots() {
    const slotY = 350;
    const slotStartX = this.sys.game.config.width / 2 - 100;
    const slotSpacing = 100;
    const slotScale = 0.09;
    for (let i = 0; i < 3; i++) {
      const x = slotStartX + i * slotSpacing;
      const slot = this.craftingSlotSprites[i];
      if (slot.image) slot.image.destroy();
      if (slot.label) slot.label.destroy();
      if (this.craftingSlots[i]) {
        slot.image = this.add.image(x, slotY, this.craftingSlots[i].key)
          .setScale(slotScale)
          .setDepth(3);
        slot.label = this.add.text(x, slotY + 32, this.craftingSlots[i].name, {
          fontFamily: 'Georgia',
          fontSize: '14px',
          color: '#228B22'
        }).setOrigin(0.5).setDepth(3);
      } else {
        slot.image = null;
        slot.label = null;
      }
    }
    // Clear result if slots change
    if (this.resultImage) this.resultImage.destroy();
    if (this.resultLabel) this.resultLabel.destroy();
    this.resultImage = null;
    this.resultLabel = null;
  }

  tryCraft() {
    // Only allow: [marigold, baseCream, marigold] in that order
    const pattern = ['marigoldPlant', 'baseCream', 'marigoldPlant'];
    const selected = this.craftingSlots.map(s => s && s.key);
    if (selected.length === 3 &&
        selected[0] === pattern[0] &&
        selected[1] === pattern[1] &&
        selected[2] === pattern[2]) {
      // Success!
      const x = this.sys.game.config.width / 2;
      const y = 480;
      this.resultImage = this.add.image(x, y, 'marigoldSalve').setScale(0.13).setDepth(4);
      this.resultLabel = this.add.text(x, y + 50, 'Marigold Salve Crafted!', {
        fontFamily: 'Georgia',
        fontSize: '20px',
        color: '#228B22'
      }).setOrigin(0.5).setDepth(4);
      // Remove items from slots
      this.craftingSlots = [null, null, null];
      this.updateCraftingSlots();
    } else {
      // Failure
      const x = this.sys.game.config.width / 2;
      const y = 480;
      this.resultLabel = this.add.text(x, y, 'Incorrect pattern! Try again.', {
        fontFamily: 'Georgia',
        fontSize: '18px',
        color: '#a33'
      }).setOrigin(0.5).setDepth(4);
      this.time.delayedCall(2000, () => {
        if (this.resultLabel) {
          this.resultLabel.destroy();
          this.resultLabel = null;
        }
      });
    }
  }
}

export default CraftingTutorial;